from django.urls import path
from .views import get_image


urlpatterns = [
    path("<str:tiny_url>", get_image, name="get_image"),
]