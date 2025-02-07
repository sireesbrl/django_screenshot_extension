from .models import TinyUrl
from rest_framework import serializers

class TinyUrlSerializer(serializers.ModelSerializer):
    class Meta:
        model = TinyUrl
        fields = ["original_url", "short_url"]