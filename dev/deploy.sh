#!/bin/bash

# Development Environment Deployment Script
# This script helps deploy the dev version to various hosting services

echo "🚀 The Daily David - Development Environment Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the dev/ directory."
    exit 1
fi

echo "✅ Found development files"
echo ""

# Show deployment options
echo "Choose your deployment method:"
echo "1) Netlify (Drag & Drop)"
echo "2) Vercel (CLI)"
echo "3) GitHub Pages"
echo "4) Local testing only"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Netlify Deployment:"
        echo "1. Go to https://app.netlify.com"
        echo "2. Drag and drop the entire 'dev' folder to the deploy area"
        echo "3. Your dev app will be available at a unique URL"
        echo "4. Update your Supabase dev config with the new URL"
        echo ""
        echo "💡 Tip: You can set up automatic deployments by connecting your GitHub repo"
        ;;
    2)
        echo ""
        echo "🚀 Vercel Deployment:"
        echo "1. Install Vercel CLI: npm i -g vercel"
        echo "2. Run: vercel --cwd dev"
        echo "3. Follow the prompts to deploy"
        echo "4. Your dev app will be available at a unique URL"
        echo ""
        echo "💡 Tip: Vercel will automatically detect your static files"
        ;;
    3)
        echo ""
        echo "📚 GitHub Pages Deployment:"
        echo "1. Create a new branch called 'gh-pages'"
        echo "2. Push your dev files to that branch"
        echo "3. Enable GitHub Pages in your repo settings"
        echo "4. Your dev app will be available at: https://username.github.io/repo-name"
        echo ""
        echo "💡 Tip: You can automate this with GitHub Actions"
        ;;
    4)
        echo ""
        echo "🖥️  Local Testing:"
        echo "1. Run: npm start (or node server.js)"
        echo "2. Open http://localhost:3001 in your browser"
        echo "3. Test your changes locally before deploying"
        echo ""
        echo "💡 Tip: Use browser dev tools to debug any issues"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🔧 Next Steps:"
echo "1. Update your Supabase dev project credentials in index.html"
echo "2. Create the 'daily_david_dev' table in your dev database"
echo "3. Test all functionality in the dev environment"
echo "4. Once satisfied, copy changes to the main index.html"
echo ""
echo "📖 For detailed instructions, see README.md"
echo ""
echo "🎉 Happy developing!"
