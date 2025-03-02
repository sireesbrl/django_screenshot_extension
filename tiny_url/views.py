import requests
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, HttpResponseNotAllowed
from tiny_url.models import TinyUrl

def get_image(request, tiny_url):
    """
    View to handle GET requests to the /{tiny_url} endpoint.

    Fetches the image at the original URL associated with the given short URL,
    and returns it to the client with a Content-Type header indicating the
    MIME type of the image. If the request is not a GET request, returns a 405
    status code. If the request is invalid or if there is an error fetching the
    image, returns a 400 or 500 status code respectively.
    """
    if request.method != 'GET':
        return HttpResponseNotAllowed(["GET"])

    tiny_url_obj = get_object_or_404(TinyUrl, short_url=tiny_url)
    image_url = tiny_url_obj.original_url

    try:
        response = requests.get(image_url, stream=True)
        response.raise_for_status()

        content_type = response.headers.get("Content-Type", "image/jpeg")

        return HttpResponse(response.content, content_type=content_type)

    except requests.RequestException as e:
        return HttpResponse(f"Error fetching image: {str(e)}", status=500)
