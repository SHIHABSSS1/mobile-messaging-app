#!/bin/bash
# Exit on error
set -e

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Echo the directory structure before any modifications
echo "=== Initial Directory Structure ==="
find . -type f -name "*.tsx" | grep -v "node_modules"
find . -type f -name "*.ts" | grep -v "node_modules"

# Clean install dependencies
npm ci

# Create a simple src directory structure if needed
echo "=== Ensuring correct directory structure ==="
mkdir -p src

# Check for nested src directory
if [ -d "src/src" ]; then
  echo "Found nested src directory, fixing structure..."
  cp -r src/src/* src/
fi

# Copy root App.tsx and reportWebVitals.ts to src if they exist at root
if [ -f "App.tsx" ] && [ ! -f "src/App.tsx" ]; then
  echo "Copying App.tsx from root to src..."
  cp App.tsx src/
fi

if [ -f "reportWebVitals.ts" ] && [ ! -f "src/reportWebVitals.ts" ]; then
  echo "Copying reportWebVitals.ts from root to src..."
  cp reportWebVitals.ts src/
fi

# Debug directory structure
echo "=== Debugging directory structure after fixes ==="
node debug.js

# Print key file contents
echo "=== Key file contents ==="
if [ -f "src/index.tsx" ]; then
  echo "src/index.tsx:"
  cat src/index.tsx
fi

if [ -f "src/App.tsx" ]; then
  echo "src/App.tsx:"
  cat src/App.tsx
fi

if [ -f "src/reportWebVitals.ts" ]; then
  echo "src/reportWebVitals.ts:"
  cat src/reportWebVitals.ts
fi

# Turn off treat warnings as errors
export CI=false

# Build the app with more verbose output
echo "=== Starting build ==="
npm run build --verbose

echo "Build completed successfully!" 