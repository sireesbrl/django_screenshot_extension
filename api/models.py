from django.db import models
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile


class Screenshot(models.Model):
    image = models.ImageField(upload_to="screenshots")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image.name

    def save(self, *args, **kwargs):
        if self.image:
            img = Image.open(self.image)
            img = img.convert("RGB")
            output_io = BytesIO()
            img.save(output_io, format="JPEG", quality=70)
            output_io.seek(0)
            self.image = ContentFile(output_io.read(), name=self.image.name)
        super().save(*args, **kwargs)