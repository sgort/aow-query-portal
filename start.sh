#!/bin/bash

echo "🚀 TriplyDB Query Portal - Quick Start"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Use local config for development (with CORS proxy)
if [ -f "config.local.json" ]; then
    echo "🔧 Using local development config (CORS proxy)"
    cp config.json config.prod.json
    cp config.local.json config.json
fi

# Check if config.json has been customized
if grep -q "Your Organization Name" config.json 2>/dev/null; then
    echo "⚠️  WARNING: config.json has not been customized yet!"
    echo "   Please update config.json with your organization details before deploying."
    echo ""
fi

# Start both dev server and CORS proxy
echo "🌐 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   CORS Proxy: http://localhost:3001"
echo ""
echo "   Press Ctrl+C to stop both servers"
echo ""

npm run dev:all
