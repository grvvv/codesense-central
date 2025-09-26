# license/services/license_config.py
from datetime import datetime, timezone
from .crypto import load_root_keys
import json
import base64
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization


def generate_license_config(license_doc: dict) -> dict:
    """
    Generate signed license config dict for export to local server.
    Includes central public key and signature.
    """
    if not license_doc:
        raise ValueError("License document not found")

    sk_pem, pk_pem = load_root_keys()

    # Fields to include in config
    payload = {
        "license_id": license_doc["id"],
        "client": license_doc["client"],  # client is client in schema
        "limits": license_doc["limits"],
        "expiry": license_doc["expiry"],
        "status": license_doc["status"],
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "central_pubkey": pk_pem.decode("utf-8"),
    }

    # Sign payload (canonical JSON string for consistency)
    payload_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")

    private_key = Ed25519PrivateKey.from_private_bytes(
        serialization.load_pem_private_key(sk_pem, password=None).private_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PrivateFormat.Raw,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )
    signature = private_key.sign(payload_bytes)

    payload["signature"] = base64.b64encode(signature).decode("utf-8")

    return payload
