from rest_framework.serializers import ModelSerializer
from .models import Screenshot


class ScreenshotSerializer(ModelSerializer):
    class Meta:
        model = Screenshot
        fields = ["image"]