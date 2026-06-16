#!/bin/bash
set -e

# Ensure persistent data directory exists
mkdir -p /home/data

cd /home/site/wwwroot

# ─── Restore @libsql Linux native binding ───
# Azure Oryx extracts node_modules.tar.gz to /node_modules/ and symlinks
# ./node_modules → /node_modules.  The standalone build doesn't include
# the Linux native binding, so we must restore it from the deploy zip.
#
# Priority order:
# 1. From the deploy zip's node_modules (always present if postbuild ran)
# 2. From _del_node_modules (leftover from previous Oryx extraction)
# 3. From .next-build/standalone/node_modules (fallback)

RESTORED=false

# Check if /node_modules/@libsql/linux-x64-gnu already exists (from tar.gz)
if [ -f "/node_modules/@libsql/linux-x64-gnu/index.node" ]; then
  echo "@libsql/linux-x64-gnu already present in /node_modules"
  RESTORED=true
fi

# Source 1: _libsql_native directory (we ship this in the deploy zip)
if [ "$RESTORED" = false ] && [ -d "_libsql_native/@libsql/linux-x64-gnu" ]; then
  echo "Restoring @libsql native bindings from _libsql_native..."
  mkdir -p /node_modules/@libsql
  cp -r _libsql_native/@libsql/linux-x64-gnu /node_modules/@libsql/ 2>/dev/null || true
  if [ -d "_libsql_native/libsql" ]; then
    cp -r _libsql_native/libsql /node_modules/ 2>/dev/null || true
  fi
  RESTORED=true
fi

# Source 2: _del_node_modules (previous Oryx extraction leftovers)
if [ "$RESTORED" = false ] && [ -d "_del_node_modules/@libsql/linux-x64-gnu" ]; then
  echo "Restoring @libsql native bindings from _del_node_modules..."
  mkdir -p /node_modules/@libsql
  cp -r _del_node_modules/@libsql/linux-x64-gnu /node_modules/@libsql/ 2>/dev/null || true
  cp -r _del_node_modules/libsql /node_modules/ 2>/dev/null || true
  RESTORED=true
fi

# Source 3: standalone node_modules
if [ "$RESTORED" = false ] && [ -d ".next-build/standalone/node_modules/@libsql/linux-x64-gnu" ]; then
  echo "Restoring @libsql native bindings from standalone..."
  mkdir -p /node_modules/@libsql
  cp -r .next-build/standalone/node_modules/@libsql/linux-x64-gnu /node_modules/@libsql/ 2>/dev/null || true
  RESTORED=true
fi

if [ "$RESTORED" = false ]; then
  echo "WARNING: Could not find @libsql/linux-x64-gnu native binding!"
fi

# Verify the binding is actually there
if [ -f "/node_modules/@libsql/linux-x64-gnu/index.node" ]; then
  echo "@libsql/linux-x64-gnu binding OK"
else
  echo "ERROR: @libsql/linux-x64-gnu/index.node NOT found after restore!"
fi

# Initialize database tables (uses @libsql/client, no native deps needed)
node init-db.js || echo "DB init: skipped or failed"

# Start standalone server (HOSTNAME and PORT set via Azure app settings)
exec node server.js
