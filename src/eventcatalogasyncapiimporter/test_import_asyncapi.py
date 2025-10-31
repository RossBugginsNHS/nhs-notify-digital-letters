"""
Tests for AsyncAPI to EventCatalog importer
"""

import os
import tempfile
import unittest
from pathlib import Path

import yaml

# Import the importer class
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from import_asyncapi import AsyncAPIImporter


class TestAsyncAPIImporter(unittest.TestCase):
    """Test cases for AsyncAPIImporter."""

    def setUp(self):
        """Set up test fixtures."""
        # Create temporary directories
        self.temp_dir = tempfile.mkdtemp()
        self.asyncapi_dir = Path(self.temp_dir) / "asyncapi"
        self.eventcatalog_dir = Path(self.temp_dir) / "eventcatalog"

        self.asyncapi_dir.mkdir()
        self.eventcatalog_dir.mkdir()

        # Create a sample AsyncAPI file
        self.sample_asyncapi = {
            "asyncapi": "3.0.0",
            "info": {
                "title": "NHS Notify Digital Letters - Test Service",
                "version": "2025-10-draft",
                "description": "Test service description",
                "contact": {"name": "Test Team", "url": "https://test.com"},
                "x-service-metadata": {
                    "c4type": "code",
                    "owner": "Test Owner",
                    "parent": "Test Domain",
                },
            },
            "channels": {
                "test_event_channel_v1": {
                    "address": "test/event/channel/v1",
                    "messages": {
                        "TestEvent": {
                            "name": "TestEvent",
                            "title": "TestEvent",
                            "summary": "Event: test.event.v1",
                            "description": "This is a test event.",
                            "contentType": "application/cloudevents+json",
                            "payload": {"$ref": "https://example.com/schema.json"},
                        }
                    },
                    "description": "Test Domain - test.event.v1",
                }
            },
            "operations": {
                "send_test_event": {
                    "action": "send",
                    "channel": {"$ref": "#/channels/test_event_channel_v1"},
                    "summary": "Send TestEvent",
                    "description": "Test service raises this event",
                    "messages": [
                        {"$ref": "#/channels/test_event_channel_v1/messages/TestEvent"}
                    ],
                }
            },
            "components": {"messages": {}},
        }

        # Write sample file
        self.sample_file = self.asyncapi_dir / "asyncapi-test-service.yaml"
        with open(self.sample_file, "w") as f:
            yaml.dump(self.sample_asyncapi, f)

    def test_importer_initialization(self):
        """Test importer can be initialized."""
        importer = AsyncAPIImporter(
            self.asyncapi_dir, self.eventcatalog_dir, verbose=False
        )
        self.assertIsNotNone(importer)
        self.assertEqual(importer.asyncapi_dir, self.asyncapi_dir)
        self.assertEqual(importer.eventcatalog_dir, self.eventcatalog_dir)

    def test_load_asyncapi_file(self):
        """Test loading an AsyncAPI file."""
        importer = AsyncAPIImporter(
            self.asyncapi_dir, self.eventcatalog_dir, verbose=False
        )
        data = importer.load_asyncapi_file(self.sample_file)
        self.assertIsNotNone(data)
        self.assertEqual(data["asyncapi"], "3.0.0")
        self.assertIn("channels", data)

    def test_sanitize_name(self):
        """Test name sanitization."""
        importer = AsyncAPIImporter(
            self.asyncapi_dir, self.eventcatalog_dir, verbose=False
        )

        # Test various inputs
        self.assertEqual(importer.sanitize_name("Test Service"), "test-service")
        self.assertEqual(
            importer.sanitize_name("MESH Poller Service"), "mesh-poller-service"
        )
        self.assertEqual(
            importer.sanitize_name("Test_Service-123"), "test-service-123"
        )
        self.assertEqual(importer.sanitize_name("  Test  "), "test")

    def test_extract_service_name(self):
        """Test service name extraction."""
        importer = AsyncAPIImporter(
            self.asyncapi_dir, self.eventcatalog_dir, verbose=False
        )
        service_name = importer.extract_service_name(self.sample_asyncapi)
        self.assertEqual(service_name, "Test Service")

    def test_extract_domain_from_service(self):
        """Test domain extraction from service metadata."""
        importer = AsyncAPIImporter(
            self.asyncapi_dir, self.eventcatalog_dir, verbose=False
        )
        domain = importer.extract_domain_from_service(
            "Test Service", self.sample_asyncapi
        )
        self.assertEqual(domain, "Test Domain")

    def test_create_domain_structure(self):
        """Test domain directory creation."""
        importer = AsyncAPIImporter(
            self.asyncapi_dir, self.eventcatalog_dir, verbose=False
        )
        domain_path = importer.create_domain_structure("Test Domain")

        self.assertTrue(domain_path.exists())
        self.assertTrue((domain_path / "index.mdx").exists())

        # Check index.mdx content
        with open(domain_path / "index.mdx", "r") as f:
            content = f.read()
            self.assertIn("Test Domain", content)
            self.assertIn("test-domain", content)

    def test_create_service_structure(self):
        """Test service directory creation."""
        importer = AsyncAPIImporter(
            self.asyncapi_dir, self.eventcatalog_dir, verbose=False
        )
        domain_path = importer.create_domain_structure("Test Domain")
        service_path = importer.create_service_structure(
            domain_path, "Test Service", self.sample_asyncapi, "Test Domain"
        )

        # Services should be under domain/services/ (nested structure)
        self.assertTrue(service_path.exists())
        self.assertTrue((service_path / "index.mdx").exists())
        self.assertTrue((domain_path / "services").exists())
        self.assertEqual(service_path.parent.name, "services")
        self.assertEqual(service_path.parent.parent, domain_path)

        # Check service is tracked
        self.assertIn("test-service", importer.created_services)

    def test_create_channel_structure(self):
        """Test channel creation."""
        importer = AsyncAPIImporter(
            self.asyncapi_dir, self.eventcatalog_dir, verbose=False
        )

        channel_data = self.sample_asyncapi["channels"]["test_event_channel_v1"]
        importer.create_channel_structure("test_event_channel_v1", channel_data)

        channel_file = importer.channels_dir / "test-event-channel-v1.mdx"
        self.assertTrue(channel_file.exists())

        # Check channel is tracked
        self.assertIn("test-event-channel-v1", importer.created_channels)

    def test_full_import(self):
        """Test full import process."""
        importer = AsyncAPIImporter(
            self.asyncapi_dir, self.eventcatalog_dir, verbose=False
        )
        importer.import_all()

        # Verify structures were created
        self.assertGreater(len(importer.created_services), 0)
        self.assertGreater(len(importer.created_channels), 0)

        # Verify domain directory exists
        domains_dir = self.eventcatalog_dir / "domains"
        self.assertTrue(domains_dir.exists())

        # Verify at least one domain was created
        domains = list(domains_dir.iterdir())
        self.assertGreater(len(domains), 0)


if __name__ == "__main__":
    unittest.main()
