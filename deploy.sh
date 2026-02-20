#!/bin/bash

# Frontend Deployment Script for VPS
# Usage: ./deploy.sh [vps-ip] [username] [deployment-path]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_IP=${1:-"your-vps-ip"}
VPS_USER=${2:-"root"}
DEPLOY_PATH=${3:-"/var/www/edureach-frontend"}
LOCAL_DIST="./dist"

echo -e "${GREEN}🚀 Starting Frontend Deployment${NC}"
echo "=================================="
echo "VPS IP: $VPS_IP"
echo "User: $VPS_USER"
echo "Deploy Path: $DEPLOY_PATH"
echo ""

# Step 1: Build the project
echo -e "${YELLOW}📦 Building production bundle...${NC}"
npm run build

if [ ! -d "$LOCAL_DIST" ]; then
    echo -e "${RED}❌ Build failed! dist folder not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"
echo ""

# Step 2: Transfer files to VPS
echo -e "${YELLOW}📤 Transferring files to VPS...${NC}"
rsync -avz --delete --progress \
    --exclude '*.map' \
    "$LOCAL_DIST/" \
    "$VPS_USER@$VPS_IP:$DEPLOY_PATH/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files transferred successfully${NC}"
else
    echo -e "${RED}❌ File transfer failed!${NC}"
    exit 1
fi

echo ""

# Step 3: Set permissions on VPS
echo -e "${YELLOW}🔐 Setting file permissions...${NC}"
ssh "$VPS_USER@$VPS_IP" "sudo chown -R www-data:www-data $DEPLOY_PATH && sudo chmod -R 755 $DEPLOY_PATH"

echo ""

# Step 4: Reload Nginx
echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
ssh "$VPS_USER@$VPS_IP" "sudo nginx -t && sudo systemctl reload nginx"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Nginx reload failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Your frontend should now be live at:"
echo "  - http://$VPS_IP"
echo "  - https://$VPS_IP (if SSL is configured)"
echo ""

