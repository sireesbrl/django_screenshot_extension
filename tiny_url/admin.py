from django.contrib import admin
from .models import TinyUrl

@admin.register(TinyUrl)
class TinyUrlAdmin(admin.ModelAdmin):
    list_display = ("original_url", "short_url")
