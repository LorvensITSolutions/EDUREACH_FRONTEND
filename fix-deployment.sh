#!/bin/bash

# Quick fix script for deployment issues
# Run this on your VPS server

echo "🔍 Checking current setup..."

# Find where nginx is serving from
NGINX_ROOT=$(grep -r "root " /etc/nginx/sites-enabled/* 2>/dev/null | grep -v "#" | grep -v "proxy_pass" | head -1 | awk '{print $2}' | sed 's/;//' | sed 's/;$//')

if [ -z "$NGINX_ROOT" ]; then
    # Try alternative method
    NGINX_ROOT=$(grep -r "root" /etc/nginx/sites-enabled/* 2>/dev/null | grep -v "#" | grep -v "proxy_pass" | head -1 | sed 's/.*root //' | sed 's/;//' | sed 's/;$//' | xargs)
fi

if [ -z "$NGINX_ROOT" ]; then
    echo "⚠️  Could not detect nginx root. Trying common locations..."
    # Try common locations
    if [ -d "/var/www/SCHOOL_WEBSITE" ]; then
        NGINX_ROOT="/var/www/SCHOOL_WEBSITE"
    elif [ -d "/var/www/html" ]; then
        NGINX_ROOT="/var/www/html"
    elif [ -d "/var/www/edureach-frontend" ]; then
        NGINX_ROOT="/var/www/edureach-frontend"
    else
        echo "❌ Could not find nginx root directory. Please specify manually."
        exit 1
    fi
fi

echo "📁 Detected Nginx root directory: $NGINX_ROOT"

# Find project directory and dist folder
CURRENT_DIR=$(pwd)
PROJECT_DIR=""

if [ -d "./dist" ]; then
    echo "✅ Found dist folder in current directory: $CURRENT_DIR"
    PROJECT_DIR="$CURRENT_DIR"
elif [ -d "/var/www/SCHOOL_WEBSITE/project/dist" ]; then
    echo "✅ Found dist folder in /var/www/SCHOOL_WEBSITE/project"
    PROJECT_DIR="/var/www/SCHOOL_WEBSITE/project"
elif [ -d "/var/www/edureach-frontend/project/dist" ]; then
    echo "✅ Found dist folder in /var/www/edureach-frontend/project"
    PROJECT_DIR="/var/www/edureach-frontend/project"
else
    echo "❌ dist folder not found. Building now..."
    if [ -d "/var/www/SCHOOL_WEBSITE/project" ]; then
        cd /var/www/SCHOOL_WEBSITE/project
        npm run build
        PROJECT_DIR="/var/www/SCHOOL_WEBSITE/project"
    elif [ -d "/var/www/edureach-frontend/project" ]; then
        cd /var/www/edureach-frontend/project
        npm run build
        PROJECT_DIR="/var/www/edureach-frontend/project"
    else
        echo "❌ Could not find project directory. Please run this script from the project directory."
        exit 1
    fi
fi

# Copy dist files to nginx root
echo "📦 Copying dist contents to nginx root ($NGINX_ROOT)..."
sudo cp -r "$PROJECT_DIR/dist/"* "$NGINX_ROOT/"

if [ $? -eq 0 ]; then
    echo "✅ Files copied successfully"
else
    echo "❌ Failed to copy files"
    exit 1
fi

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data "$NGINX_ROOT"
sudo chmod -R 755 "$NGINX_ROOT"

# Check nginx config
echo "🔍 Testing nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "⚠️  Nginx configuration test failed!"
    exit 1
fi

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo "📁 Files deployed to: $NGINX_ROOT"
    echo "💡 If changes don't show, clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
else
    echo "❌ Failed to reload nginx"
    exit 1
fi

