# licenses/models.py
from bson import ObjectId
from datetime import datetime, timezone
from common.db import MongoDBClient

class LicenseModel:
    collection = MongoDBClient.get_database()["licenses"]

    @staticmethod
    def serialize(doc):
        if not doc:
            return None
        return {
            "id": str(doc.get("_id")),
            "client": {
                "name": doc.get("client", {}).get("name"),
                "contact_email": doc.get("client", {}).get("contact_email"),
            },
            "limits": doc.get("limits", {}),
            "usage": doc.get("usage", {}),
            "expiry": doc["expiry"].isoformat() if isinstance(doc.get("expiry"), datetime) else doc.get("expiry"),
            "status": doc.get("status"),
            "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None,
            "updated_at": doc["updated_at"].isoformat() if doc.get("updated_at") else None,
        }

    @classmethod
    def create(cls, client_name, contact_email, limits, expiry):
        data = {
            "client": {
                "name": client_name,
                "contact_email": contact_email,
            },
            "limits": limits,
            "usage": {
                "scans": 0,
                "users": 0,
            },
            "expiry": expiry,
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = cls.collection.insert_one(data)
        return cls.serialize(cls.find_by_id(result.inserted_id))

    @classmethod
    def find_by_id(cls, id):
        return cls.collection.find_one({"_id": ObjectId(id)})

    @classmethod
    def update(cls, license_id, data):
        cls.collection.update_one({"_id": ObjectId(license_id)}, {"$set": data})
        return cls.serialize(cls.find_by_id(license_id))
    
    @classmethod
    def update_status(cls, license_id, status):
        return cls.collection.update_one(
            {"_id": ObjectId(license_id)},
            {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
        )

    # @classmethod
    # def increment_scan(cls, license_id):
    #     return cls.collection.update_one(
    #         {"license_id": license_id, "status": "active"},
    #         {"$inc": {"limits.scans": 1}, "$set": {"updated_at": datetime.now(timezone.utc)}}
    #     )

    @classmethod
    def list_all(cls, page=1, limit=10):
        try:
            skip = (page - 1) * limit
            cursor = cls.collection.find().skip(skip).limit(limit)
            licenses = [cls.serialize(doc) for doc in cursor]
            total = cls.collection.count_documents({})
            return {
                "licenses": licenses,
                "pagination": {
                    "total": total,
                    "page": page,
                    "limit": limit,
                    "pages": (total + limit - 1) // limit
                }
            }
        except Exception as e:
            return {"error": f"Internal Server Error: {str(e)}"}
