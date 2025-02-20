from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from io import BytesIO
from PIL import Image
from api.models import Screenshot
from api.views import ScreenshotUploadView

class TestScreenshotUploadView(TestCase):
    def setUp(self):
        """Set up test data, client, and URL."""
        self.client = APIClient()
        self.upload_url = reverse('screenshot_upload')

    def create_image_blob(self):
        """Helper method to create an in-memory image blob."""
        image = Image.new('RGB', (100, 100), color=(255, 0, 0))
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        return SimpleUploadedFile('image.jpg', img_byte_arr.read(), content_type='image/jpeg')

    def test_successful_screenshot_upload(self):
        """Test successful screenshot upload and tiny URL generation."""
        uploaded_file = self.create_image_blob()
        data = {'image': uploaded_file}
        response = self.client.post(self.upload_url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tiny_url', response.data)

    def test_failed_screenshot_upload_invalid_data(self):
        """Test failed upload with invalid data."""
        data = {'invalid_field': 'invalid_data'}
        response = self.client.post(self.upload_url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('image', response.data)
        self.assertEqual(response.data['image'][0].code, 'required')

    def test_screenshot_upload_missing_required_fields(self):
        """Test upload with missing required fields."""
        data = {}
        response = self.client.post(self.upload_url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('image', response.data)
        self.assertEqual(response.data['image'][0].code, 'required')

    def test_screenshot_upload_invalid_file_type(self):
        """Test upload with an invalid file type (simulated text file)."""
        file_content = b"This is a test text file, not an image."
        uploaded_file = SimpleUploadedFile(
            'invalid_file.txt', file_content, content_type='text/plain'
        )
        
        data = {'image': uploaded_file}
        response = self.client.post(self.upload_url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('image', response.data)
        self.assertIn('valid image', response.data['image'][0].lower())

    def tearDown(self):
        """Clean up any resources after tests."""
        pass

