# Quick Fix: Connect Frontend to Production Backend

## 🚨 Current Issue

Frontend is calling `localhost:5000` instead of `https://api.edureachapp.com/api`

## ⚡ Quick Fix Steps

### Step 1: Create Production Environment File

```bash
cd school_webiste/school_webiste/school_webiste/project
```

Create `.env.production`:

```bash
echo "VITE_API_BASE_URL=https://api.edureachapp.com/api" > .env.production
```

### Step 2: Rebuild Frontend

```bash
npm run build
```

### Step 3: Deploy Updated Build

**If deploying from local:**

```bash
# Build locally
npm run build

# Deploy to VPS
rsync -avz --delete dist/ user@vps-ip:/var/www/edureach-frontend/

# Set permissions
ssh user@vps-ip "sudo chown -R www-data:www-data /var/www/edureach-frontend"
ssh user@vps-ip "sudo systemctl reload nginx"
```

**If deploying from VPS:**

```bash
# On VPS
cd /var/www/SCHOOL_WEBSITE/project

# Create .env.production
echo "VITE_API_BASE_URL=https://api.edureachapp.com/api" > .env.production

# Rebuild
npm run build

# Files are already in place, just reload Nginx
sudo systemctl reload nginx
```

### Step 4: Update Backend CORS

On your backend server, ensure `.env` includes:

```env
FRONTEND_URL=https://edureachapp.com,https://www.edureachapp.com
```

Then restart backend:

```bash
pm2 restart edureach-backend
# or
sudo systemctl restart edureach-backend
```

### Step 5: Verify

1. Open https://edureachapp.com
2. Open browser console (F12)
3. Check for: `🔗 API Base URL: https://api.edureachapp.com/api`
4. Check Network tab - all API calls should go to `api.edureachapp.com`
5. No `localhost:5000` errors

## ✅ Done!

Your frontend should now connect to the production backend.

