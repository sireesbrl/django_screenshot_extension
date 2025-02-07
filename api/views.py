from rest_framework.generics import CreateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .serializers import ScreenshotSerializer
from .models import Screenshot
import requests

class ScreenshotUploadView(CreateAPIView):
    queryset = Screenshot.objects.all()
    serializer_class = ScreenshotSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            screenshot = serializer.save()
            image_url = request.build_absolute_uri(screenshot.image.url)
            tiny_url = self.get_tiny_url(image_url)
            return Response({"image_url": image_url, "tiny_url": tiny_url}, status=201)
            #return Response({"image_url": f"http://127.0.0.1:8000{screenshot.image.url}"}, status=201)

        return Response(serializer.errors, status=400)

    def get_tiny_url(self, url):
        api_url = f"http://tinyurl.com/api-create.php?url={url}"
        response = requests.get(api_url)
        
        if response.status_code == 200:
            return response.text
        else:
            return url