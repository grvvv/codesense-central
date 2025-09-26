# license/services/crypto.py
import os
import base64
from pathlib import Path
from typing import Tuple, Dict, Any
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey, Ed25519PublicKey
)
from cryptography.hazmat.primitives import serialization
import jwt  # pyjwt
from django.conf import settings

# Config: override via environment if desired
CENTRAL_KEYS_DIR = Path(getattr(settings, "CENTRAL_KEYS_DIR"))

def ensure_keys_dir() -> None:
    CENTRAL_KEYS_DIR.mkdir(parents=True, exist_ok=True)
    CENTRAL_KEYS_DIR.chmod(0o700)

def generate_root_keypair(path: Path | None = None) -> None:
    """
    Generate central root keypair and save as PEM files.
    Run once (ops) and protect the private key heavily.
    """
    path = path or CENTRAL_KEYS_DIR
    ensure_keys_dir()
    sk = Ed25519PrivateKey.generate()
    pk = sk.public_key()

    sk_pem = sk.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pk_pem = pk.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    (path / "central_root_sk.pem").write_bytes(sk_pem)
    (path / "central_root_pk.pem").write_bytes(pk_pem)

    os.chmod(path / "central_root_sk.pem", 0o600)
    os.chmod(path / "central_root_pk.pem", 0o644)


def load_root_keys(path: Path | None = None) -> Tuple[bytes, bytes]:
    """Return tuple (sk_pem_bytes, pk_pem_bytes)."""
    path = path or CENTRAL_KEYS_DIR
    sk = (path / "central_root_sk.pem").read_bytes()
    pk = (path / "central_root_pk.pem").read_bytes()
    return sk, pk


# --- JWT helpers (EdDSA / Ed25519) ---

def sign_jwt(payload: Dict[str, Any], sk_pem: bytes, ttl_seconds: int | None = None) -> str:
    """
    Sign a JWT using Ed25519 private key bytes (PEM).
    Optionally adds `iat` and `exp` if ttl_seconds is provided.
    Returns compact JWT (string).
    """
    now = datetime.now(timezone.utc)
    claims = payload.copy()
    claims["iat"] = int(now.timestamp())
    if ttl_seconds:
        claims["exp"] = int((now + timedelta(seconds=ttl_seconds)).timestamp())

    return jwt.encode(claims, sk_pem, algorithm="EdDSA")


def verify_jwt(token: str, pk_pem: bytes) -> Dict[str, Any]:
    """
    Verify a JWT signed with Ed25519 public key bytes (PEM).
    Returns payload dict or raises jwt exceptions.
    """
    return jwt.decode(token, pk_pem, algorithms=["EdDSA"])


# --- Specialized helpers ---

def issue_provisioning_jwt(local_id: str, license_id: str, sk_pem: bytes) -> str:
    """Longer-lived JWT (e.g., 1 day) issued during provisioning."""
    payload = {"local_id": local_id, "license_id": license_id, "type": "provisioning"}
    return sign_jwt(payload, sk_pem, ttl_seconds=86400)  # 24h


def issue_assertion_jwt(local_id: str, license_id: str, sk_pem: bytes) -> str:
    """Short-lived JWT (e.g., 10 min) for scan authorization."""
    payload = {"local_id": local_id, "license_id": license_id, "type": "assertion"}
    return sign_jwt(payload, sk_pem, ttl_seconds=600)  # 10 min


# --- Nonce helper (used by challenge endpoint) ---

def random_nonce(n: int = 32) -> str:
    return base64.urlsafe_b64encode(os.urandom(n)).decode().rstrip("=")
