from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, HttpResponseNotAllowed
from tiny_url.models import TinyUrl

def get_image(request, tiny_url):
    """
    Redirects a GET request with a short_url to the original_url associated
    with that short_url.

    If the request is not a GET, returns a 405 Method Not Allowed response.

    :param request: The request object
    :param short_url: The short_url to redirect
    :return: A redirect response to the original_url
    """
    if request.method != 'GET':
        return HttpResponseNotAllowed("Method Not Allowed")
    
    tiny_url = get_object_or_404(TinyUrl, short_url=tiny_url)
    return HttpResponseRedirect(tiny_url.original_url)
