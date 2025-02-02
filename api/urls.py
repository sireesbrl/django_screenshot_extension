from django.urls import path
from .views import ScreenshotUploadView

urlpatterns = [
    path("upload/", ScreenshotUploadView.as_view(), name="screenshot_upload"),
]