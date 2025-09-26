# license/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import json

from ..models.license_model import LicenseModel
from ..serializers.license_serializers import LicenseCreateSerializer, LicenseUpdateSerializer
from ..services.license_config import generate_license_config

class LicenseCreateView(APIView):
    """
    POST /licenses/
    Create a new license.
    """
    def post(self, request):
        serializer = LicenseCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        license_doc = LicenseModel.create(
            client_name=data["client"]["name"],
            contact_email=data["client"]["contact_email"],
            limits=data["limits"],
            expiry=data["expiry"],
        )

        return Response(
            license_doc,
            status=status.HTTP_201_CREATED,
        )


class LicenseListView(APIView):
    """
    GET /licenses/?page=1&limit=10
    List all licenses with pagination.
    """
    def get(self, request):
        try:
            page = int(request.query_params.get("page", 1))
            limit = int(request.query_params.get("limit", 10))
        except ValueError:
            return Response({"error": "Invalid pagination parameters"}, status=status.HTTP_400_BAD_REQUEST)

        result = LicenseModel.list_all(page=page, limit=limit)
        return Response(result, status=status.HTTP_200_OK)


class LicenseDetailView(APIView):
    """
    GET /licenses/{license_id}/
    Retrieve a single license by license_id.
    """
    def get(self, request, license_id):
        doc = LicenseModel.find_by_id(license_id)
        if not doc:
            return Response({"error": "License not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(LicenseModel.serialize(doc), status=status.HTTP_200_OK)
    
    def patch(self, request, license_id):
        doc = LicenseModel.find_by_id(license_id)
        if not doc:
            return Response({"error": "License not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LicenseUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            updated = LicenseModel.update(license_id=license_id, data=serializer.validated_data)
            return Response(updated, status=status.HTTP_202_ACCEPTED)
        return Response({ "error": serializer.errors }, status=status.HTTP_400_BAD_REQUEST)


class LicenseStatusUpdateView(APIView):
    """
    PATCH /licenses/status/{license_id}/
    Update license status (active | expired | revoked).
    """
    def patch(self, request, license_id):
        new_status = request.data.get("status")
        if new_status not in ["active", "expired", "revoked"]:
            return Response(
                {"error": "Invalid status. Must be one of: active, expired, revoked"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = LicenseModel.update_status(license_id, new_status)
        if result.modified_count == 0:
            return Response({"error": "License not found or status unchanged"}, status=status.HTTP_404_NOT_FOUND)

        updated_doc = LicenseModel.find_by_id(license_id)
        return Response(LicenseModel.serialize(updated_doc), status=status.HTTP_200_OK)

class LicenseConfigExportView(APIView):
    """
    GET /licenses/config/{license_id}/
    Export license config JSON (signed).
    """

    def get(self, request, license_id):
        doc = LicenseModel.find_by_id(license_id)
        if not doc:
            return Response({"error": "License not found"}, status=status.HTTP_404_NOT_FOUND)

        config = generate_license_config(LicenseModel.serialize(doc))

        # Return as downloadable file
        response = HttpResponse(
            json.dumps(config, indent=2),
            content_type="application/octet-stream"
        )
        response["Content-Disposition"] = f'attachment; filename="license_{license_id}.json"'
        return response
