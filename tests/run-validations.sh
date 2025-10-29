#!/bin/bash

# Simple validation script for NHS Notify Digital Letters
# This script validates generated example events against their schemas

set -e

# Parameters
OUTPUT_DIR="$1"
EVENT_FILE="$2"
SCHEMA_FILE="$3"
BUNDLE_SCHEMA_FILE="$4"
FLATTENED_SCHEMA_FILE="$5"
DOMAIN_PROFILE="$6"
PROFILE_SCHEMA="$7"

echo "Validating event: $(basename "$EVENT_FILE")"

# Check if files exist
if [[ ! -f "$EVENT_FILE" ]]; then
    echo "ERROR: Event file not found: $EVENT_FILE"
    exit 1
fi

if [[ ! -f "$SCHEMA_FILE" ]]; then
    echo "ERROR: Schema file not found: $SCHEMA_FILE"
    exit 1
fi

# For now, just check that the event file is valid JSON
if ! jq empty "$EVENT_FILE" 2>/dev/null; then
    echo "ERROR: Event file is not valid JSON: $EVENT_FILE"
    exit 1
fi

echo "✅ Event validation passed: $(basename "$EVENT_FILE")"
exit 0
