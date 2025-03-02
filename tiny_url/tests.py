from django.test import TestCase, RequestFactory
from django.http import HttpResponse, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from unittest.mock import patch, MagicMock
from tiny_url.models import TinyUrl
from tiny_url.views import get_image

class GetImageViewTests(TestCase):
    def setUp(self):
        """Set up test data and request factory."""
        self.factory = RequestFactory()
        self.tiny_url = TinyUrl.objects.create(
            original_url="https://example.com/image.jpg", short_url="abc123"
        )

    @patch("requests.get")
    def test_get_request_with_valid_tiny_url(self, mock_get):
        """Test GET request with a valid short URL returns an image response."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = b"fake_image_data"
        mock_response.headers = {"Content-Type": "image/jpeg"}
        mock_get.return_value = mock_response

        request = self.factory.get(f"/{self.tiny_url.short_url}")
        response = get_image(request, self.tiny_url.short_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/jpeg")
        self.assertIsInstance(response, HttpResponse)
        self.assertEqual(response.content, b"fake_image_data")

    def test_get_request_with_invalid_tiny_url(self):
        """Test GET request with an invalid short URL raises 404."""
        request = self.factory.get("/invalid-url")

        with self.assertRaisesMessage(Exception, "No TinyUrl matches the given query."):
            get_image(request, "invalid-url")

    def test_non_get_request(self):
        """Test that a POST request to the view returns 405 Method Not Allowed."""
        request = self.factory.post(f"/{self.tiny_url.short_url}")
        response = get_image(request, self.tiny_url.short_url)

        self.assertEqual(response.status_code, 405)
        self.assertIsInstance(response, HttpResponseNotAllowed)
