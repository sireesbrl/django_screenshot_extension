from .models import TinyUrl

def generate_short_url(original_url):
    tinyurl, created = TinyUrl.objects.get_or_create(original_url=original_url)
    return tinyurl.short_url