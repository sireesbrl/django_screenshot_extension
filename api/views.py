from rest_framework.generics import CreateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .serializers import ScreenshotSerializer
from .models import Screenshot
from tiny_url.utils import generate_short_url

class ScreenshotUploadView(CreateAPIView):
    queryset = Screenshot.objects.all()
    serializer_class = ScreenshotSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        """
        Override CreateAPIView's create method to return a response with the
        tiny url instead of the serializer data.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            screenshot = serializer.save()
            image_url = request.build_absolute_uri(screenshot.image.url)
            baseurl = request.build_absolute_uri("/")
            tiny_url = baseurl + generate_short_url(image_url)
            return Response({"tiny_url": tiny_url}, status=201)

        return Response(serializer.errors, status=400)
