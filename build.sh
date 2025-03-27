#!/bin/bash
# Exit on error
set -e

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Echo the directory structure before any modifications
echo "=== Initial Directory Structure ==="
find . -type f -name "*.tsx" | grep -v "node_modules"
find . -type f -name "*.ts" | grep -v "node_modules"

# Use npm install instead of npm ci since there's no package-lock.json
echo "=== Installing dependencies ==="
npm install

# Create a simple src directory structure if needed
echo "=== Ensuring correct directory structure ==="
mkdir -p src

# Check for nested src directory
if [ -d "src/src" ]; then
  echo "Found nested src directory, fixing structure..."
  cp -r src/src/* src/
  rm -rf src/src
fi

# Ensure App.tsx is in src directory
if [ -f "App.tsx" ] && [ ! -f "src/App.tsx" ]; then
  echo "Copying App.tsx from root to src..."
  cp App.tsx src/
fi

if [ -f "reportWebVitals.ts" ] && [ ! -f "src/reportWebVitals.ts" ]; then
  echo "Copying reportWebVitals.ts from root to src..."
  cp reportWebVitals.ts src/
fi

# Make sure no app code is referring to files outside src directory
echo "=== Checking and fixing import paths ==="
if [ -f "src/index.tsx" ]; then
  # Update imports in index.tsx to use local paths
  sed -i 's|from "../App"|from "./App"|g' src/index.tsx
  sed -i 's|from "../reportWebVitals"|from "./reportWebVitals"|g' src/index.tsx
fi

# Debug directory structure
echo "=== Debugging directory structure after fixes ==="
find src -type f | grep -v "node_modules"

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