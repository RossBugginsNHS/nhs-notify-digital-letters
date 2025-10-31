#!/usr/bin/env python3
"""
AsyncAPI to EventCatalog Importer

This script imports AsyncAPI specifications into EventCatalog structure.
It creates domains, services, channels, and events based on AsyncAPI definitions.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

import yaml


class AsyncAPIImporter:
    """Imports AsyncAPI specifications into EventCatalog structure."""

    def __init__(
        self,
        asyncapi_dir: Path,
        eventcatalog_dir: Path,
        domain_name: str = "Digital Letters",
        verbose: bool = False,
    ):
        """
        Initialize the importer.

        Args:
            asyncapi_dir: Directory containing AsyncAPI YAML files
            eventcatalog_dir: EventCatalog root directory
            domain_name: Name of the domain to create
            verbose: Enable verbose logging
        """
        self.asyncapi_dir = Path(asyncapi_dir)
        self.eventcatalog_dir = Path(eventcatalog_dir)
        self.domain_name = domain_name
        self.verbose = verbose

        # Create base directories
        self.domains_dir = self.eventcatalog_dir / "domains"
        self.channels_dir = self.eventcatalog_dir / "channels"

        # Track created resources to avoid duplicates
        self.created_services: Set[str] = set()
        self.created_events: Set[str] = set()
        self.created_channels: Set[str] = set()

    def log(self, message: str, level: str = "INFO") -> None:
        """Log a message."""
        if self.verbose or level in ["ERROR", "WARNING"]:
            print(f"[{level}] {message}")

    def load_asyncapi_file(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Load and parse an AsyncAPI YAML file."""
        try:
            with open(file_path, "r") as f:
                data = yaml.safe_load(f)
            self.log(f"Loaded AsyncAPI file: {file_path.name}")
            return data
        except Exception as e:
            self.log(f"Error loading {file_path}: {e}", "ERROR")
            return None

    def sanitize_name(self, name: str) -> str:
        """Sanitize a name for use in file paths and IDs."""
        # Convert to lowercase, replace spaces and special chars with hyphens
        sanitized = re.sub(r"[^a-z0-9]+", "-", name.lower())
        # Remove leading/trailing hyphens
        sanitized = sanitized.strip("-")
        return sanitized

    def extract_service_name(self, asyncapi_data: Dict[str, Any]) -> str:
        """Extract service name from AsyncAPI specification."""
        info = asyncapi_data.get("info", {})
        title = info.get("title", "Unknown Service")
        # Remove common prefixes
        title = title.replace("NHS Notify Digital Letters - ", "")
        return title

    def extract_domain_from_service(
        self, service_name: str, asyncapi_data: Dict[str, Any]
    ) -> str:
        """Extract domain name from service metadata or name."""
        info = asyncapi_data.get("info", {})
        metadata = info.get("x-service-metadata", {})
        parent = metadata.get("parent", "")

        if parent:
            return parent

        # Fallback to parsing service name
        if "mesh" in service_name.lower():
            return "MESH Services"
        elif "pdm" in service_name.lower():
            return "PDM Services"
        elif "reporting" in service_name.lower():
            return "Reporting"
        else:
            return "Core Services"

    def create_domain_structure(self, domain_name: str) -> Path:
        """Create domain directory structure."""
        domain_slug = self.sanitize_name(domain_name)
        domain_path = self.domains_dir / domain_slug

        if not domain_path.exists():
            domain_path.mkdir(parents=True, exist_ok=True)

            # Create index.md for domain
            index_content = f"""---
id: {domain_slug}
name: {domain_name}
version: 0.0.1
summary: |
  {domain_name} domain
---

## Overview

This domain contains services related to {domain_name}.

<NodeGraph />
"""
            index_file = domain_path / "index.md"
            with open(index_file, "w") as f:
                f.write(index_content)

            self.log(f"Created domain: {domain_name}")

        return domain_path

    def create_service_structure(
        self, domain_path: Path, service_name: str, asyncapi_data: Dict[str, Any]
    ) -> Path:
        """Create service directory structure."""
        service_slug = self.sanitize_name(service_name)
        service_path = domain_path / service_slug

        if service_slug in self.created_services:
            self.log(f"Service already exists: {service_name}", "DEBUG")
            return service_path

        service_path.mkdir(parents=True, exist_ok=True)

        info = asyncapi_data.get("info", {})
        description = info.get("description", f"{service_name} service")
        version = info.get("version", "0.0.1")
        metadata = info.get("x-service-metadata", {})

        # Create index.md for service
        index_content = f"""---
id: {service_slug}
name: {service_name}
version: {version}
summary: |
  {description}
"""

        # Add owners if available
        if metadata.get("owner"):
            index_content += f"owners:\n  - {metadata['owner']}\n"

        index_content += """---

## Overview

{description}

## Architecture

<NodeGraph />
"""

        index_file = service_path / "index.md"
        with open(index_file, "w") as f:
            f.write(index_content)

        self.created_services.add(service_slug)
        self.log(f"Created service: {service_name}")

        return service_path

    def create_event_structure(
        self,
        service_path: Path,
        event_name: str,
        channel_address: str,
        message_data: Dict[str, Any],
        action: str,
    ) -> None:
        """Create event structure within a service."""
        event_slug = self.sanitize_name(event_name)
        events_dir = service_path / "events"
        events_dir.mkdir(exist_ok=True)

        event_key = f"{service_path.name}/{event_slug}"
        if event_key in self.created_events:
            self.log(f"Event already exists: {event_name}", "DEBUG")
            return

        # Extract event details
        summary = message_data.get("summary", event_name)
        description = message_data.get("description", "")
        content_type = message_data.get("contentType", "application/cloudevents+json")

        # Determine if it's a published or subscribed event
        event_type = "published" if action == "send" else "received"

        # Create event markdown file
        event_content = f"""---
id: {event_slug}
name: {event_name}
version: 1.0.0
summary: |
  {summary}
---

## Overview

{description}

**Channel**: `{channel_address}`

**Content Type**: `{content_type}`

**Event Type**: {event_type.capitalize()}

## Schema
"""

        # Add schema reference if available
        payload = message_data.get("payload", {})
        if "$ref" in payload:
            event_content += f"\nSchema Reference: `{payload['$ref']}`\n"

        traits = message_data.get("traits", [])
        if traits:
            event_content += "\n## Additional Information\n\n"
            for trait in traits:
                trait_desc = trait.get("description", "")
                if trait_desc:
                    event_content += f"- {trait_desc}\n"

        event_file = events_dir / f"{event_slug}.md"
        with open(event_file, "w") as f:
            f.write(event_content)

        self.created_events.add(event_key)
        self.log(f"Created event: {event_name} ({event_type})")

    def create_channel_structure(
        self, channel_name: str, channel_data: Dict[str, Any]
    ) -> None:
        """Create channel structure."""
        channel_slug = self.sanitize_name(channel_name)

        if channel_slug in self.created_channels:
            self.log(f"Channel already exists: {channel_name}", "DEBUG")
            return

        self.channels_dir.mkdir(exist_ok=True)

        address = channel_data.get("address", channel_name)
        description = channel_data.get("description", f"Channel: {channel_name}")

        # Create channel markdown file
        channel_content = f"""---
id: {channel_slug}
name: {channel_name}
version: 1.0.0
address: {address}
summary: |
  {description}
---

## Overview

{description}

**Address**: `{address}`

## Messages

This channel carries the following messages:

"""

        # Add message references
        messages = channel_data.get("messages", {})
        for msg_name, msg_data in messages.items():
            msg_summary = msg_data.get("summary", msg_name)
            channel_content += f"- **{msg_name}**: {msg_summary}\n"

        channel_file = self.channels_dir / f"{channel_slug}.md"
        with open(channel_file, "w") as f:
            f.write(channel_content)

        self.created_channels.add(channel_slug)
        self.log(f"Created channel: {channel_name}")

    def process_asyncapi_file(self, file_path: Path) -> None:
        """Process a single AsyncAPI file."""
        self.log(f"\nProcessing: {file_path.name}")

        asyncapi_data = self.load_asyncapi_file(file_path)
        if not asyncapi_data:
            return

        # Extract service information
        service_name = self.extract_service_name(asyncapi_data)
        domain_name = self.extract_domain_from_service(service_name, asyncapi_data)

        # Create domain structure
        domain_path = self.create_domain_structure(domain_name)

        # Create service structure
        service_path = self.create_service_structure(
            domain_path, service_name, asyncapi_data
        )

        # Process channels
        channels = asyncapi_data.get("channels", {})
        for channel_name, channel_data in channels.items():
            self.create_channel_structure(channel_name, channel_data)

        # Process operations to create events
        operations = asyncapi_data.get("operations", {})
        for op_name, op_data in operations.items():
            action = op_data.get("action", "")
            channel_ref = op_data.get("channel", {}).get("$ref", "")

            # Extract channel name from reference
            if channel_ref.startswith("#/channels/"):
                channel_name = channel_ref.replace("#/channels/", "")
                channel_data = channels.get(channel_name, {})

                # Get messages
                messages_data = channel_data.get("messages", {})
                for msg_name, msg_data in messages_data.items():
                    # Get full message data if it's a reference
                    if "$ref" in msg_data:
                        msg_ref = msg_data["$ref"]
                        if msg_ref.startswith(f"#/channels/{channel_name}/messages/"):
                            msg_data = messages_data.get(msg_name, msg_data)

                    channel_address = channel_data.get("address", channel_name)
                    self.create_event_structure(
                        service_path, msg_name, channel_address, msg_data, action
                    )

    def import_all(self) -> None:
        """Import all AsyncAPI files from the directory."""
        if not self.asyncapi_dir.exists():
            self.log(f"AsyncAPI directory not found: {self.asyncapi_dir}", "ERROR")
            sys.exit(1)

        # Find all AsyncAPI YAML files
        yaml_files = list(self.asyncapi_dir.glob("asyncapi-*.yaml"))

        if not yaml_files:
            self.log(
                f"No AsyncAPI files found in {self.asyncapi_dir}", "WARNING"
            )
            return

        self.log(f"Found {len(yaml_files)} AsyncAPI files to process\n")

        # Process each file
        for yaml_file in sorted(yaml_files):
            # Skip the 'all' file as it's a combined view
            if yaml_file.name == "asyncapi-all.yaml":
                self.log(f"Skipping combined file: {yaml_file.name}")
                continue

            self.process_asyncapi_file(yaml_file)

        # Print summary
        self.log(f"\n{'='*60}")
        self.log("Import Summary:")
        self.log(f"  Services created: {len(self.created_services)}")
        self.log(f"  Events created: {len(self.created_events)}")
        self.log(f"  Channels created: {len(self.created_channels)}")
        self.log(f"{'='*60}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Import AsyncAPI specifications into EventCatalog",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage with default paths
  python import_asyncapi.py

  # Custom paths
  python import_asyncapi.py \\
    --asyncapi-dir /path/to/asyncapi/output \\
    --eventcatalog-dir /path/to/eventcatalog

  # Verbose output
  python import_asyncapi.py --verbose

  # Custom domain name
  python import_asyncapi.py --domain "My Domain"
        """,
    )

    # Get script directory for default paths
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent.parent

    parser.add_argument(
        "--asyncapi-dir",
        type=str,
        default=str(repo_root / "src/asyncapigenerator/output"),
        help="Directory containing AsyncAPI YAML files (default: src/asyncapigenerator/output)",
    )

    parser.add_argument(
        "--eventcatalog-dir",
        type=str,
        default=str(repo_root / "src/eventcatalog/digital-letters"),
        help="EventCatalog root directory (default: src/eventcatalog/digital-letters)",
    )

    parser.add_argument(
        "--domain",
        type=str,
        default="Digital Letters",
        help="Name of the domain to create (default: Digital Letters)",
    )

    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose logging",
    )

    args = parser.parse_args()

    # Create importer and run
    importer = AsyncAPIImporter(
        asyncapi_dir=args.asyncapi_dir,
        eventcatalog_dir=args.eventcatalog_dir,
        domain_name=args.domain,
        verbose=args.verbose,
    )

    try:
        importer.import_all()
        print("\n✅ Import completed successfully!")
    except Exception as e:
        print(f"\n❌ Import failed: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
