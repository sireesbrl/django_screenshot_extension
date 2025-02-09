from .models import Screenshot
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import os

@shared_task
def delete_old_screenshots():
    threshold_date = timezone.now() - timedelta(days=30)
    old_screenshots = Screenshot.objects.filter(uploaded_at__lt=threshold_date)
    for screenshot in old_screenshots:
        image_path = screenshot.image.path
        if os.path.exists(image_path):
            os.remove(image_path)
    old_screenshots.delete()
    return f"Deleted {len(old_screenshots)} screenshots older than 30 days"