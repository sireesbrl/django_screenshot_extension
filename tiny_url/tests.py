from django.test import TestCase, RequestFactory
from django.http import HttpResponseRedirect, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from tiny_url.models import TinyUrl
from tiny_url.views import get_image

class GetImageViewTests(TestCase):
    def setUp(self):
        """Set up test data and request factory."""
        self.factory = RequestFactory()
        self.tiny_url = TinyUrl.objects.create(
            original_url="https://example.com", short_url="abc123"
        )

    def test_get_request_with_valid_tiny_url(self):
        """Test GET request with a valid short URL redirects correctly."""
        request = self.factory.get(f"/{self.tiny_url.short_url}")
        response = get_image(request, self.tiny_url.short_url)

        self.assertIsInstance(response, HttpResponseRedirect)
        self.assertEqual(response.url, self.tiny_url.original_url)

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

