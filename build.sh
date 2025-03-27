#!/bin/bash
# Exit on error
set -e

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean install dependencies
npm ci

# Turn off treat warnings as errors
export CI=false

# Build the app
npm run build

echo "Build completed successfully!" 