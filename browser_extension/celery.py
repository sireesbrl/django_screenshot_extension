from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "browser_extension.settings")
app = Celery("browser_extension")
app.conf.enable_utc = False
app.conf.timezone = "Asia/Kathmandu"
app.conf.broker_url = "redis://localhost:6379"
app.conf.beat_scheduler = "django_celery_beat.schedulers:DatabaseScheduler"
app.conf.accept_content = ["application/json"]
app.conf.result_serializer = "json"
app.conf.task_serializer = "json"
app.conf.result_backend = "django-db"
app.conf.broker_connection_retry_on_startup = True
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")