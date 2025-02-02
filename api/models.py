from django.db import models


class Screenshot(models.Model):
    image = models.ImageField(upload_to="screenshots")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image.name