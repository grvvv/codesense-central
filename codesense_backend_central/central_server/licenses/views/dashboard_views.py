from datetime import datetime, timezone
from django.http import JsonResponse
from common.db import MongoDBClient
from rest_framework.views import APIView

db = MongoDBClient.get_database()

class DashboardView(APIView):

    def get(self, request):
        licenses = list(db.licenses.find({}))  # fetch all licenses

        response = {"license": []}  # top-level key

        for license_doc in licenses:
            # Linked locals count
            locals_count = db.locals.count_documents({"license_id": license_doc["_id"]})

            # Users count (global or per license depending on your schema)
            users_count = db.users.count_documents({"deleted": False})

            # Scan usage %
            scan_limit = license_doc["limits"]["scans"]
            scan_usage = license_doc["usage"]["scans"]
            scan_percentage = round((scan_usage / scan_limit) * 100, 2) if scan_limit else 0

            # User usage %
            user_limit = license_doc["limits"]["users"]
            user_usage = license_doc["usage"]["users"]
            user_percentage = round((user_usage / user_limit) * 100, 2) if user_limit else 0

            # Expiry check
            expiry_date = license_doc["expiry"].replace(tzinfo=timezone.utc)
            days_left = (expiry_date - datetime.now(timezone.utc)).days

            response["license"].append({
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
                "locals": {
                    "total": locals_count
                },
                "users_summary": {   # renamed to avoid duplicate "users"
                    "total": users_count
                }
            })

        return JsonResponse(response, safe=False)
