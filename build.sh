#!/bin/bash
# Exit on error
set -e

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean install dependencies
npm ci

# Debug directory structure
echo "=== Debugging directory structure ==="
node debug.js

# Check if App.tsx exists in the expected location
if [ ! -f "src/App.tsx" ]; then
  echo "ERROR: App.tsx is missing. Checking possible locations..."
  find . -name "App.tsx" -o -name "App.js" | grep -v "node_modules"
  
  # Check if there's nested src directory
  if [ -d "src/src" ] && [ -f "src/src/App.tsx" ]; then
    echo "Found App.tsx in src/src, fixing structure..."
    cp -r src/src/* src/
  fi
fi

# Turn off treat warnings as errors
export CI=false

# Build the app
npm run build

echo "Build completed successfully!" 