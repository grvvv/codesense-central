from rest_framework import serializers

class LocalProvisionSerializer(serializers.Serializer):
    license_id = serializers.CharField(required=True)
    local_pubkey = serializers.CharField(required=True)
    machine_uuid = serializers.CharField(required=False, allow_blank=True)
