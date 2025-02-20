from .models import TinyUrl

def generate_short_url(original_url):
    base_original_url = original_url.split("&")[0]
    tinyurl, created = TinyUrl.objects.get_or_create(original_url=base_original_url)
    return tinyurl.short_url