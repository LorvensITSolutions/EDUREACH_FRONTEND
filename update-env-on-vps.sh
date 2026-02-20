#!/bin/bash

# Script to update VITE_API_BASE_URL on VPS server
# Run this script on your VPS server

echo "🔧 Updating Production Environment Variable"
echo "=========================================="
echo ""

# Get current directory
CURRENT_DIR=$(pwd)
PROJECT_DIR=""

# Find project directory
if [ -f "./package.json" ] && [ -f "./vite.config.js" ]; then
    PROJECT_DIR="$CURRENT_DIR"
    echo "✅ Found project in current directory: $PROJECT_DIR"
elif [ -d "/var/www/edureach-frontend/project" ]; then
    PROJECT_DIR="/var/www/edureach-frontend/project"
    echo "✅ Found project at: $PROJECT_DIR"
elif [ -d "/var/www/SCHOOL_WEBSITE/project" ]; then
    PROJECT_DIR="/var/www/SCHOOL_WEBSITE/project"
    echo "✅ Found project at: $PROJECT_DIR"
else
    echo "❌ Could not find project directory."
    echo "Please run this script from your project directory or specify the path."
    exit 1
fi

cd "$PROJECT_DIR"

# Prompt for backend URL
echo ""
echo "Enter your production backend API URL:"
echo "Examples:"
echo "  - https://api.yourdomain.com/api"
echo "  - http://your-vps-ip:5000/api"
echo "  - https://yourdomain.com/api"
echo ""
read -p "Backend URL: " BACKEND_URL

# Validate URL
if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL cannot be empty!"
    exit 1
fi

# Create .env.production file
echo "📝 Creating .env.production file..."
echo "VITE_API_BASE_URL=$BACKEND_URL" > .env.production

# Verify file was created
if [ -f ".env.production" ]; then
    echo "✅ .env.production created successfully!"
    echo ""
    echo "Contents:"
    cat .env.production
    echo ""
else
    echo "❌ Failed to create .env.production file!"
    exit 1
fi

# Ask if user wants to rebuild now
echo ""
read -p "Do you want to rebuild the frontend now? (y/n): " REBUILD

if [ "$REBUILD" = "y" ] || [ "$REBUILD" = "Y" ]; then
    echo ""
    echo "🔨 Building frontend with production environment..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build completed successfully!"
        
        # Find nginx root
        NGINX_ROOT=$(grep -r "root " /etc/nginx/sites-enabled/* 2>/dev/null | grep -v "#" | grep -v "proxy_pass" | head -1 | awk '{print $2}' | sed 's/;//' | sed 's/;$//')
        
        if [ -z "$NGINX_ROOT" ]; then
            if [ -d "/var/www/edureach-frontend" ]; then
                NGINX_ROOT="/var/www/edureach-frontend"
            elif [ -d "/var/www/html" ]; then
                NGINX_ROOT="/var/www/html"
            else
                echo "⚠️  Could not detect nginx root. Please copy dist/ files manually."
                exit 0
            fi
        fi
        
        echo ""
        echo "📦 Copying build files to nginx root: $NGINX_ROOT"
        sudo cp -r dist/* "$NGINX_ROOT/"
        
        echo "🔐 Setting permissions..."
        sudo chown -R www-data:www-data "$NGINX_ROOT"
        sudo chmod -R 755 "$NGINX_ROOT"
        
        echo "🔄 Reloading nginx..."
        sudo nginx -t && sudo systemctl reload nginx
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Deployment completed successfully!"
            echo "💡 Clear browser cache (Ctrl+Shift+R) to see changes"
        else
            echo "❌ Failed to reload nginx"
        fi
    else
        echo "❌ Build failed! Please check the errors above."
        exit 1
    fi
else
    echo ""
    echo "⚠️  Remember to rebuild before deploying:"
    echo "   npm run build"
    echo ""
    echo "Then copy dist/ files to your nginx root directory."
fi

echo ""
echo "✅ Environment variable updated successfully!"
echo ""


