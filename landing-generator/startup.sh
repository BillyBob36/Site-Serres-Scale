#!/bin/bash
set -e

# Ensure persistent data directory exists
mkdir -p /home/data

cd /home/site/wwwroot

# Run Prisma migrations
node node_modules/prisma/build/index.js migrate deploy || echo "Migration: skipped or up to date"

# Start standalone server (HOSTNAME and PORT set via Azure app settings)
exec node server.js
