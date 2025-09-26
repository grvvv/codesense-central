from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import uuid
import base64
from bson import ObjectId
from datetime import datetime, timezone

from licenses.models.license_model import LicenseModel
from licenses.models.local_model import LocalModel
from licenses.serializers.local_serializers import LocalProvisionSerializer
from licenses.services.crypto import load_root_keys, issue_provisioning_jwt, issue_assertion_jwt, random_nonce, verify_jwt

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature

class LocalProvisionView(APIView):
    """
    Step 1: Provision Local
    Local sends its pubkey + license_id.
    Central validates license and issues provisioning package.
    """

    def post(self, request):
        serializer = LocalProvisionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        license_id = data["license_id"]

        # Validate license exists and active
        license_doc = LicenseModel.find_by_id(license_id)
        if not license_doc or license_doc["status"] != "active":
            return Response({"error": "Invalid or inactive license"}, status=status.HTTP_404_NOT_FOUND)

        # Create local record
        local_id = f"LOCAL-{uuid.uuid4().hex[:6].upper()}"
        local_doc = LocalModel.create(
            license_id=license_doc["_id"],
            local_id=local_id,
            public_key=data["local_pubkey"],
            machine_uuid=data.get("machine_uuid"),
        )

        # Load Central root keys
        sk_pem, pk_pem = load_root_keys()

        # Issue provisioning JWT (valid ~24h)
        provisioning_jwt = issue_provisioning_jwt(local_id, license_id, sk_pem)

        # Response package
        return Response(
            {
                "local_id": local_id,
                "license_id": license_id,
                "central_pubkey": pk_pem.decode(),
                "provisioning_jwt": provisioning_jwt,
            },
            status=status.HTTP_201_CREATED,
        )


# Step 1: Request Challenge
class ChallengeRequestView(APIView):
    """
    Local sends provisioning_jwt and requests a challenge nonce.
    """

    def post(self, request):
        try:
            license_id = request.data.get("license_id")
            local_id = request.data.get("local_id")
            provisioning_jwt = request.data.get("provisioning_jwt")

            if not (license_id and local_id and provisioning_jwt):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            # Load central root keys
            _, central_pk = load_root_keys()

            # Verify provisioning JWT
            payload = verify_jwt(provisioning_jwt, central_pk)
            if payload.get("local_id") != local_id or payload.get("license_id") != license_id:
                return Response({"error": "Provisioning token mismatch"}, status=status.HTTP_403_FORBIDDEN)

            # Generate and store nonce
            nonce = random_nonce()
            result = LocalModel.collection.update_one(
                {"local_id": local_id, "license_id": ObjectId(license_id)},
                {"$set": {"nonce": nonce}},
            )

            return Response({"nonce": nonce}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Step 2: Submit Assertion
class ChallengeAssertionView(APIView):
    """
    Local signs nonce with its private key and submits.
    Central verifies signature and issues assertion_jwt.
    Also enforces usage limits if provided.
    """

    def post(self, request):
        try:
            license_id = request.data.get("license_id")
            local_id = request.data.get("local_id")
            provisioning_jwt = request.data.get("provisioning_jwt")
            nonce = request.data.get("nonce")
            signed_nonce_b64 = request.data.get("signed_nonce")
            usage_type = request.data.get("usage_type")  # optional: "scan" or "user"

            if not all([license_id, local_id, provisioning_jwt, nonce, signed_nonce_b64]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            # Load central root keys
            central_sk, central_pk = load_root_keys()

            # Verify provisioning JWT
            payload = verify_jwt(provisioning_jwt, central_pk)
            if payload.get("local_id") != local_id or payload.get("license_id") != license_id:
                return Response({"error": "Provisioning token mismatch"}, status=status.HTTP_403_FORBIDDEN)

            # Fetch local record
            local_doc = LocalModel.get_by_local_id(local_id)
            if not local_doc or str(local_doc.get("license_id")) != license_id:
                return Response({"error": "Local not found or mismatched license"}, status=status.HTTP_404_NOT_FOUND)

            # Verify nonce matches
            if local_doc.get("nonce") != nonce:
                return Response({"error": "Invalid nonce"}, status=status.HTTP_403_FORBIDDEN)

            # Verify signed nonce using local's stored public key
            public_key_pem = local_doc.get("public_key")
            public_key = Ed25519PublicKey.from_public_bytes(
                serialization.load_pem_public_key(public_key_pem.encode()).public_bytes(
                    encoding=serialization.Encoding.Raw,
                    format=serialization.PublicFormat.Raw
                )
            )

            try:
                public_key.verify(
                    base64.urlsafe_b64decode(signed_nonce_b64 + "=="),
                    nonce.encode()
                )
            except InvalidSignature:
                return Response({"error": "Invalid signature"}, status=status.HTTP_403_FORBIDDEN)

            # ---- NEW: Enforce limits ----
            license_doc = LicenseModel.find_by_id(license_id)
            if not license_doc or license_doc.get("status") != "active":
                return Response({"error": "License not active"}, status=status.HTTP_403_FORBIDDEN)

            limits = license_doc["limits"]
            usage = license_doc.get("usage", {"scans": 0, "users": 0})

            if usage_type == "scan":
                if usage["scans"] >= limits["scans"]:
                    return Response({"error": "Scan limit reached"}, status=status.HTTP_403_FORBIDDEN)
                usage["scans"] += 1

            elif usage_type == "user":
                if usage["users"] >= limits["users"]:
                    return Response({"error": "User limit reached"}, status=status.HTTP_403_FORBIDDEN)
                usage["users"] += 1

            # Update license usage
            LicenseModel.collection.update_one(
                {"_id": license_doc["_id"]},
                {"$set": {"usage": usage}}
            )

            # ---- Issue assertion_jwt ----
            assertion_jwt = issue_assertion_jwt(local_id, license_id, central_sk)

            # Clear nonce (one-time use)
            LocalModel.collection.update_one(
                {"local_id": local_id}, {"$unset": {"nonce": ""}}
            )

            return Response({
                "assertion_jwt": assertion_jwt,
                "usage": usage,
                "remaining": {
                    "scans": limits["scans"] - usage["scans"],
                    "users": limits["users"] - usage["users"]
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdateUsageView(APIView):
    """
    Local signs nonce with its private key and submits.
    Central verifies signature and issues assertion_jwt.
    Also enforces usage limits if provided.
    """

    def post(self, request):
        try:
            license_id = request.data.get("license_id")
            local_id = request.data.get("local_id")
            provisioning_jwt = request.data.get("provisioning_jwt")
            nonce = request.data.get("nonce")
            signed_nonce_b64 = request.data.get("signed_nonce")
            usage_type = request.data.get("usage_type")  # optional: "scan" or "user"

            if not all([license_id, local_id, provisioning_jwt, nonce, signed_nonce_b64]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            # Load central root keys
            central_sk, central_pk = load_root_keys()

            # Verify provisioning JWT
            payload = verify_jwt(provisioning_jwt, central_pk)
            if payload.get("local_id") != local_id or payload.get("license_id") != license_id:
                return Response({"error": "Provisioning token mismatch"}, status=status.HTTP_403_FORBIDDEN)

            # Fetch local record
            local_doc = LocalModel.get_by_local_id(local_id)
            if not local_doc or str(local_doc.get("license_id")) != license_id:
                return Response({"error": "Local not found or mismatched license"}, status=status.HTTP_404_NOT_FOUND)

            # Verify nonce matches
            if local_doc.get("nonce") != nonce:
                return Response({"error": "Invalid nonce"}, status=status.HTTP_403_FORBIDDEN)

            # Verify signed nonce using local's stored public key
            public_key_pem = local_doc.get("public_key")
            public_key = Ed25519PublicKey.from_public_bytes(
                serialization.load_pem_public_key(public_key_pem.encode()).public_bytes(
                    encoding=serialization.Encoding.Raw,
                    format=serialization.PublicFormat.Raw
                )
            )

            try:
                public_key.verify(
                    base64.urlsafe_b64decode(signed_nonce_b64 + "=="),
                    nonce.encode()
                )
            except InvalidSignature:
                return Response({"error": "Invalid signature"}, status=status.HTTP_403_FORBIDDEN)

            # ---- NEW: Enforce limits ----
            license_doc = LicenseModel.find_by_id(license_id)
            if not license_doc or license_doc.get("status") != "active":
                return Response({"error": "License not active"}, status=status.HTTP_403_FORBIDDEN)

            limits = license_doc["limits"]
            usage = license_doc.get("usage", {"scans": 0, "users": 0})

            if usage_type == "scan":
                if usage["scans"] >= limits["scans"]:
                    return Response({"error": "Scan limit reached"}, status=status.HTTP_403_FORBIDDEN)
                usage["scans"] += 1

            elif usage_type == "user":
                if usage["users"] >= limits["users"]:
                    return Response({"error": "User limit reached"}, status=status.HTTP_403_FORBIDDEN)
                usage["users"] += 1

            # Update license usage
            LicenseModel.collection.update_one(
                {"_id": license_doc["_id"]},
                {"$set": {"usage": usage}}
            )

            # ---- Issue assertion_jwt ----
            assertion_jwt = issue_assertion_jwt(local_id, license_id, central_sk)

            # Clear nonce (one-time use)
            LocalModel.collection.update_one(
                {"local_id": local_id}, {"$unset": {"nonce": ""}}
            )

            return Response({
                "assertion_jwt": assertion_jwt,
                "usage": usage,
                "remaining": {
                    "scans": limits["scans"] - usage["scans"],
                    "users": limits["users"] - usage["users"]
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LocalDetailsView(APIView):
    def get(self, request, license_id):
        # Fetch license
        license_doc = LicenseModel.find_by_id(license_id)
        local_doc = LocalModel.get_by_license(license_id=license_id)
        # Calculate scan usage %
        scan_limit = license_doc["limits"]["scans"]
        scan_usage = license_doc["usage"]["scans"]
        scan_percentage = round((scan_usage / scan_limit) * 100, 2)

        # Calculate user usage %
        user_limit = license_doc["limits"]["users"]
        user_usage = license_doc["usage"]["users"]
        user_percentage = round((user_usage / user_limit) * 100, 2)

        # Expiry check
        expiry_date = license_doc["expiry"].replace(tzinfo=timezone.utc)
        days_left = (expiry_date - datetime.now(timezone.utc)).days


        response = {
            "client": license_doc["client"],
            "status": license_doc["status"],
            "expiry_date": expiry_date.strftime("%Y-%m-%d"),
            "days_left": days_left,
            "scans": {
                "used": scan_usage,
                "limit": scan_limit,
                "percentage": scan_percentage
            },
            "users": {
                "used": user_usage,
                "limit": user_limit,
                "percentage": user_percentage
            },
            "local": local_doc
        }

        return Response(response, status=status.HTTP_200_OK)
