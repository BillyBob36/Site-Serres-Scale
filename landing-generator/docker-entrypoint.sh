#!/bin/sh
set -e

# Ensure the data directory exists (Azure App Service persistent storage)
mkdir -p /home/data

# Run Prisma migrations
export DATABASE_URL="file:/home/data/landing.db"
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Start Next.js
exec node server.js
