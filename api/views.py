from rest_framework.generics import CreateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .serializers import ScreenshotSerializer
from .models import Screenshot

class ScreenshotUploadView(CreateAPIView):
    queryset = Screenshot.objects.all()
    serializer_class = ScreenshotSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            screenshot = serializer.save()
            return Response({"image_url": f"http://127.0.0.1:8000{screenshot.image.url}"}, status=201)

        return Response(serializer.errors, status=400)