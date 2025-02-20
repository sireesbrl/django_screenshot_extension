import string
import random
from django.db import models

class TinyUrl(models.Model):
    original_url = models.URLField()
    short_url = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return f"{self.original_url} -> {self.short_url}"

    def save(self, *args, **kwargs):
        if not self.short_url:
            self.short_url = self._generate_short_url()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_short_url():
        characters = string.ascii_letters + string.digits
        while True:
            short_url = "".join(random.choices(characters, k=6))
            if not TinyUrl.objects.filter(short_url=short_url).exists():
                return short_url

    class Meta:
        indexes = [models.Index(fields=['short_url'])]