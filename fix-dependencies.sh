#!/bin/bash

echo "🔧 Fixing Express dependencies..."

# Navigate to backend directory
cd backend

# Remove node_modules and package-lock.json
echo "📦 Removing old dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies with Express 4
echo "⬇️  Installing Express 4.x and dependencies..."
npm install

echo "✅ Dependencies fixed!"
echo "🚀 You can now run: npm start"
