#!/bin/bash
set -e

# Ensure persistent data directory exists
mkdir -p /home/data

cd /home/site/wwwroot

# Initialize database tables (uses @libsql/client, no native deps needed)
node init-db.js || echo "DB init: skipped or failed"

# Start standalone server (HOSTNAME and PORT set via Azure app settings)
exec node server.js
