# license/serializers/license_serializers.py
from datetime import datetime, timezone
from rest_framework import serializers


class LicenseCreateSerializer(serializers.Serializer):
    client_name = serializers.CharField(required=True)
    client_email = serializers.EmailField(required=True)
    scans_limit = serializers.IntegerField(required=True, min_value=1)
    users_limit = serializers.IntegerField(required=True, min_value=1)
    expiry = serializers.DateTimeField(required=True)

    def validate_expiry(self, value):
        if value <= datetime.now(timezone.utc):
            raise serializers.ValidationError("Expiry must be in the future")
        return value

    def to_internal_value(self, data):
        """
        Transform flat input into schema-compliant format
        {
            "client": {"name": ..., "contact_email": ...},
            "limits": {"scans": ..., "users": ...},
            "expiry": ...
        }
        """
        validated = super().to_internal_value(data)
        return {
            "client": {
                "name": validated["client_name"],
                "contact_email": validated["client_email"],
            },
            "limits": {
                "scans": validated["scans_limit"], 
                "users": validated["users_limit"]
            },
            "expiry": validated["expiry"],
        }

class LicenseUpdateSerializer(serializers.Serializer):
    client_name = serializers.CharField(required=False)
    client_email = serializers.EmailField(required=False)
    scans_limit = serializers.IntegerField(required=False, min_value=1)
    users_limit = serializers.IntegerField(required=False, min_value=1)
    expiry = serializers.DateTimeField(required=False)
    status = serializers.ChoiceField(choices=['active', 'revoked', 'expired'], required=True)

    def validate_expiry(self, value):
        if value <= datetime.now(timezone.utc):
            raise serializers.ValidationError("Expiry must be in the future")
        return value

    def to_internal_value(self, data):
        """
        Transform flat input into schema-compliant format
        {
            "client": {"name": ..., "contact_email": ...},
            "limits": {"scans": ..., "users": ...},
            "expiry": ...
        }
        """
        validated = super().to_internal_value(data)
        return {
            "client": {
                "name": validated["client_name"],
                "contact_email": validated["client_email"],
            },
            "limits": {
                "scans": validated["scans_limit"], 
                "users": validated["users_limit"]
            },
            "expiry": validated["expiry"],
            "status": validated["status"]
        }
