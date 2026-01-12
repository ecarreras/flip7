#!/bin/bash
# Script to update the cache version in service-worker.js with current timestamp

# Get current timestamp in the same format used in the service worker
TIMESTAMP=$(date -u +"%Y-%m-%d-%H-%M-%S")

# Update the CACHE_VERSION line in service-worker.js
sed -i "s/const CACHE_VERSION = '[^']*';/const CACHE_VERSION = '${TIMESTAMP}';/" service-worker.js

echo "Updated CACHE_VERSION to: ${TIMESTAMP}"
