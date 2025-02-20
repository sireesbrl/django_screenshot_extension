from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, HttpResponseNotAllowed
from tiny_url.models import TinyUrl

def get_image(request, short_url):
    if request.method != 'GET':
        return HttpResponseNotAllowed("Method Not Allowed")
    
    tiny_url = get_object_or_404(TinyUrl, short_url=short_url)
    return HttpResponseRedirect(tiny_url.original_url)
