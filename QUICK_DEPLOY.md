# Quick Deployment Guide - Push Code to VPS

This is a simplified guide to deploy your updated frontend code to the VPS server.

## 🚀 Quick Steps

### Step 1: Ensure Production Environment File Exists

Create `.env.production` file in the project folder:

```bash
cd school_webiste/school_webiste/school_webiste/project
```

Create the file:
```bash
echo "VITE_API_BASE_URL=https://api.edureachapp.com/api" > .env.production
```

Verify it was created:
```bash
cat .env.production
```

Should show:
```
VITE_API_BASE_URL=https://api.edureachapp.com/api
```

### Step 2: Build the Production Version

```bash
npm run build
```

This will create a `dist/` folder with optimized production files.

### Step 3: Deploy to VPS

You have two options:

#### Option A: Using the Deploy Script (Recommended)

Make sure the script is executable:
```bash
chmod +x deploy.sh
```

Run the deployment script:
```bash
./deploy.sh YOUR_VPS_IP root /var/www/edureach-frontend
```

Replace:
- `YOUR_VPS_IP` with your actual VPS IP address
- `root` with your VPS username (if different)
- `/var/www/edureach-frontend` with your actual deployment path

#### Option B: Manual Deployment using rsync

```bash
# Build first (if not already done)
npm run build

# Deploy using rsync
rsync -avz --delete --progress \
    --exclude '*.map' \
    dist/ \
    root@YOUR_VPS_IP:/var/www/edureach-frontend/

# Set permissions on VPS
ssh root@YOUR_VPS_IP "sudo chown -R www-data:www-data /var/www/edureach-frontend && sudo chmod -R 755 /var/www/edureach-frontend"

# Reload Nginx
ssh root@YOUR_VPS_IP "sudo nginx -t && sudo systemctl reload nginx"
```

#### Option C: Manual Deployment using SCP

```bash
# Build first
npm run build

# Transfer files
scp -r dist/* root@YOUR_VPS_IP:/var/www/edureach-frontend/

# Then SSH into VPS and set permissions
ssh root@YOUR_VPS_IP
sudo chown -R www-data:www-data /var/www/edureach-frontend
sudo chmod -R 755 /var/www/edureach-frontend
sudo nginx -t && sudo systemctl reload nginx
exit
```

### Step 4: Verify Deployment

1. Visit your website: `https://edureachapp.com`
2. Open browser console (F12)
3. Check that the API URL is correct
4. Test login/functionality

## 📝 Important Notes

1. **Always build before deploying** - The `dist/` folder must be up-to-date
2. **Check .env.production** - Make sure it has the correct backend API URL
3. **Backup first** (optional but recommended):
   ```bash
   ssh root@YOUR_VPS_IP "cp -r /var/www/edureach-frontend /var/www/edureach-frontend-backup-$(date +%Y%m%d)"
   ```

## 🔧 Troubleshooting

### If deployment fails:

1. **Check SSH connection:**
   ```bash
   ssh root@YOUR_VPS_IP
   ```

2. **Check Nginx status:**
   ```bash
   ssh root@YOUR_VPS_IP "sudo systemctl status nginx"
   ```

3. **Check file permissions:**
   ```bash
   ssh root@YOUR_VPS_IP "ls -la /var/www/edureach-frontend"
   ```

4. **Check Nginx error logs:**
   ```bash
   ssh root@YOUR_VPS_IP "sudo tail -f /var/log/nginx/error.log"
   ```

## 🎯 One-Line Quick Deploy

If you've set up SSH keys and know your VPS details:

```bash
npm run build && rsync -avz --delete dist/ root@YOUR_VPS_IP:/var/www/edureach-frontend/ && ssh root@YOUR_VPS_IP "sudo chown -R www-data:www-data /var/www/edureach-frontend && sudo systemctl reload nginx"
```

Replace `YOUR_VPS_IP` with your actual VPS IP address.

