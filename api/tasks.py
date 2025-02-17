from .models import Screenshot
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

@shared_task
def delete_old_screenshots():
    threshold_date = timezone.now() - timedelta(days=30)
    old_screenshots = Screenshot.objects.filter(uploaded_at__lt=threshold_date)
    count = old_screenshots.count()
    for screenshot in old_screenshots:
        screenshot.image.delete(save=False)
    old_screenshots.delete()
    return f"Deleted {count} screenshots older than 30 days"