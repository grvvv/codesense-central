# licenses/models.py
from bson import ObjectId
from datetime import datetime, timezone
from common.db import MongoDBClient

class LocalModel:
    collection = MongoDBClient.get_database()["locals"]

    @staticmethod
    def serialize(local_doc):
        if not local_doc:
            return None
        return {
            "id": str(local_doc.get("_id")),
            "license_id": str(local_doc.get("license_id")),
            "local_id": local_doc.get("local_id"),  # unique UUID per local
            "public_key": local_doc.get("public_key"),  # PEM or fingerprint
            "machine_uuid": local_doc.get("machine_uuid"),  # optional system identifier
            "status": local_doc.get("status"),  # active | blocked | revoked
            "created_at": local_doc["created_at"].isoformat() if local_doc.get("created_at") else None,
            "updated_at": local_doc["updated_at"].isoformat() if local_doc.get("updated_at") else None,
        }

    @classmethod
    def create(cls, license_id, local_id, public_key, machine_uuid=None):
        data = {
            "license_id": ObjectId(license_id),
            "local_id": local_id,  # generated during provisioning
            "public_key": public_key,  # store PEM or base64 fingerprint
            "machine_uuid": machine_uuid,  # optional system-level identifier
            "status": "active",
            "nonce": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = cls.collection.insert_one(data)
        return cls.serialize(cls.find_by_id(result.inserted_id))

    @classmethod
    def find_by_id(cls, local_id):
        return cls.collection.find_one({"_id": ObjectId(local_id)})

    @classmethod
    def get_by_local_id(cls, local_id):
        return cls.collection.find_one({"local_id": local_id})

    @classmethod
    def get_by_license(cls, license_id):
        return cls.serialize(cls.collection.find_one({"license_id": ObjectId(license_id)}))

    @classmethod
    def update_status(cls, local_id, status):
        return cls.collection.update_one(
            {"_id": ObjectId(local_id)},
            {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}},
        )

    @classmethod
    def block(cls, local_id):
        return cls.update_status(local_id, "blocked")

    @classmethod
    def revoke(cls, local_id):
        return cls.update_status(local_id, "revoked")

    @classmethod
    def list_all(cls, page=1, limit=10):
        try:
            skip = (page - 1) * limit
            cursor = cls.collection.find().skip(skip).limit(limit)
            locals_ = [cls.serialize(doc) for doc in cursor]
            total = cls.collection.count_documents({})
            return {
                "locals": locals_,
                "pagination": {
                    "total": total,
                    "page": page,
                    "limit": limit,
                    "pages": (total + limit - 1) // limit,
                },
            }
        except Exception as e:
            return {"error": f"Internal Server Error: {str(e)}"}
