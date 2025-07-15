#!/bin/bash

echo "🚀 Starting CrystalTriage deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️ Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Ask for deployment platform
echo ""
echo "🌐 Choose deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Railway"
echo "3) Render"
echo "4) Docker"
echo "5) Local production server"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "Installing Vercel CLI..."
            npm i -g vercel
            vercel --prod
        fi
        ;;
    2)
        echo "🚀 Deploying to Railway..."
        if command -v railway &> /dev/null; then
            railway up
        else
            echo "Installing Railway CLI..."
            npm i -g @railway/cli
            echo "Please run 'railway login' first, then 'railway init' and 'railway up'"
        fi
        ;;
    3)
        echo "🚀 Setting up for Render..."
        echo "Please connect your GitHub repo to Render and use these settings:"
        echo "  Build Command: npm run build"
        echo "  Start Command: npm start"
        echo "  Environment: Node.js"
        ;;
    4)
        echo "🐳 Building Docker image..."
        docker build -t crystaltriage .
        echo "Run with: docker run -p 5000:5000 crystaltriage"
        ;;
    5)
        echo "🏃 Starting local production server..."
        npm start
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo "Your beautiful CrystalTriage app is ready! ✨"
