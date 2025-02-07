from .models import TinyUrl
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404

def get_image(request, tiny_url):
    if request.method == "GET":
        tinyurl = get_object_or_404(TinyUrl, short_url=tiny_url)
        original_url = tinyurl.original_url
        return HttpResponseRedirect(original_url)