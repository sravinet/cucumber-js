#!/bin/bash

# Setup script for Hono Cucumber Demo

echo "Setting up Hono Cucumber Demo..."

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Install global vitest if needed
echo "Checking for vitest..."
if ! command -v vitest &> /dev/null
then
    echo "Installing vitest globally..."
    pnpm install -g vitest
fi

# Create KV namespace for local development
echo "Creating KV namespace for local development..."
npx wrangler kv:namespace create COUNTER --preview
npx wrangler kv:namespace create COUNTER

echo "Setup complete! You can now run the application with 'pnpm run dev'"
echo "Run tests with 'pnpm test'" 