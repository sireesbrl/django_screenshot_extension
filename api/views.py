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
        Handle POST requests to the API endpoint. The request body should contain
        a field named 'image' with the image data.

        If the request is valid, it will be saved and a response with a 201 status
        code will be returned. The response body will contain a JSON object with a
        single key, 'tiny_url', which will contain the short URL for the uploaded
        image.

        If the request is invalid, a response with a 400 status code will be
        returned. The response body will contain a JSON object with a single key,
        'error', which will contain a string describing the error.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            screenshot = serializer.save()
            image_url = request.build_absolute_uri(screenshot.image.url)
            baseurl = request.build_absolute_uri("/")
            tiny_url = baseurl + generate_short_url(image_url)
            return Response({"tiny_url": tiny_url}, status=201)

        return Response(serializer.errors, status=400)
