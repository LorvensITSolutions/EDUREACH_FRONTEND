# Frontend Deployment Guide for VPS Server

This guide will walk you through deploying the EduReach frontend application to a VPS server.

## Prerequisites

- A VPS server with Ubuntu/Debian (or similar Linux distribution)
- SSH access to your VPS
- Domain name (optional but recommended)
- Basic knowledge of Linux commands

---

## Step 1: Prepare Your Local Environment

### 1.1 Build the Production Version

```bash
# Navigate to your project directory
cd school_webiste/school_webiste/school_webiste/project

# Install dependencies (if not already installed)
npm install

# Create production build
npm run build
```

This will create a `dist` folder with optimized production files.

### 1.2 Check Environment Variables

Make sure your `.env.production` file has the correct backend API URL:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

If you don't have `.env.production`, create it:

```bash
cp .env.development .env.production
# Then edit it with production values
```

---

## Step 2: Set Up Your VPS Server

### 2.1 Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### 2.2 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2.3 Install Nginx

```bash
sudo apt install nginx -y
```

### 2.4 Install Node.js (if you need it for any server-side processes)

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

---

## Step 3: Transfer Files to VPS

### Option A: Using SCP (Secure Copy)

From your local machine:

```bash
# Navigate to your project directory
cd school_webiste/school_webiste/school_webiste/project

# Build the project first
npm run build

# Transfer the dist folder to VPS
scp -r dist/* root@your-vps-ip:/var/www/edureach-frontend/

# Or if using a specific user
scp -r dist/* username@your-vps-ip:/var/www/edureach-frontend/
```

### Option B: Using Git (Recommended)

On your VPS:

```bash
# Install Git if not already installed
sudo apt install git -y

# Create directory for your app
sudo mkdir -p /var/www/edureach-frontend
sudo chown -R $USER:$USER /var/www/edureach-frontend

# Clone your repository
cd /var/www/edureach-frontend
git clone https://github.com/G-ESWARBHAI/SCHOOL_WEBSITE.git .

# Navigate to project directory
cd project

# Install dependencies
npm install

# Build the project
npm run build
```

### Option C: Using rsync (Efficient for updates)

```bash
# From your local machine
cd school_webiste/school_webiste/school_webiste/project
npm run build

rsync -avz --delete dist/ root@your-vps-ip:/var/www/edureach-frontend/
```

---

## Step 4: Configure Nginx

### 4.1 Create Nginx Configuration File

```bash
sudo nano /etc/nginx/sites-available/edureach-frontend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # If using IP address only, replace with:
    # server_name your-vps-ip;

    root /var/www/edureach-frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location block
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Error pages
    error_page 404 /index.html;
}
```

### 4.2 Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/edureach-frontend /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## Step 5: Set Up Firewall

```bash
# Allow HTTP traffic
sudo ufw allow 'Nginx Full'
# or separately:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall (if not already enabled)
sudo ufw enable

# Check firewall status
sudo ufw status
```

---

## Step 6: Set Up SSL Certificate (HTTPS) - Recommended

### 6.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtain SSL Certificate

```bash
# Replace with your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### 6.3 Auto-renewal (Already set up by Certbot)

Certbot automatically sets up a cron job. Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## Step 7: Verify Deployment

1. **Check Nginx Status:**
   ```bash
   sudo systemctl status nginx
   ```

2. **Check if site is accessible:**
   - Open browser and visit: `http://your-domain.com` or `http://your-vps-ip`
   - If SSL is set up, visit: `https://your-domain.com`

3. **Check Nginx Logs (if issues):**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

---

## Step 8: Update Deployment (For Future Updates)

### Quick Update Process:

```bash
# On your VPS
cd /var/www/edureach-frontend/project

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# The files are already in the correct location, Nginx will serve the new build
```

Or if using rsync from local:

```bash
# On your local machine
cd school_webiste/school_webiste/school_webiste/project
npm run build
rsync -avz --delete dist/ root@your-vps-ip:/var/www/edureach-frontend/
```

---

## Step 9: Set Up Process Management (Optional - for Node.js processes)

If you need to run any Node.js processes on the server:

### Install PM2

```bash
sudo npm install -g pm2
```

### Create PM2 Ecosystem File (if needed)

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'edureach-frontend',
    script: 'npm',
    args: 'run preview', // if you want to run Vite preview server
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Troubleshooting

### Issue: 502 Bad Gateway
- Check if Nginx is running: `sudo systemctl status nginx`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify file permissions: `sudo chown -R www-data:www-data /var/www/edureach-frontend`

### Issue: 404 Not Found
- Check if files exist: `ls -la /var/www/edureach-frontend`
- Verify Nginx root path in config
- Check if `index.html` exists

### Issue: CORS Errors
- Make sure backend API URL in `.env.production` is correct
- Check backend CORS settings allow your frontend domain

### Issue: Assets Not Loading
- Check file permissions: `sudo chmod -R 755 /var/www/edureach-frontend`
- Verify Nginx can read files: `sudo chown -R www-data:www-data /var/www/edureach-frontend`

### Issue: SSL Certificate Issues
- Check certificate: `sudo certbot certificates`
- Renew if needed: `sudo certbot renew`

---

## Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Set up fail2ban:**
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

3. **Configure firewall properly:**
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   ```

4. **Regular backups:**
   - Set up automated backups of `/var/www/edureach-frontend`

5. **Monitor logs:**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

---

## Quick Reference Commands

```bash
# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (without downtime)
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check disk space
df -h

# Check memory usage
free -h
```

---

## Environment Variables Setup

If you need to set environment variables on the server:

1. Create `.env.production` in your project:
   ```bash
   cd /var/www/edureach-frontend/project
   nano .env.production
   ```

2. Add your variables:
   ```env
   VITE_API_BASE_URL=https://your-backend-api.com/api
   ```

3. Rebuild:
   ```bash
   npm run build
   ```

---

## Summary

Your frontend should now be accessible at:
- **HTTP:** `http://your-domain.com` or `http://your-vps-ip`
- **HTTPS:** `https://your-domain.com` (if SSL is configured)

The application will automatically serve the `index.html` for all routes (SPA routing), and static assets will be cached for optimal performance.

