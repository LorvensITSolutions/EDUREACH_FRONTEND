# Production Deployment Guide - EduReach

This guide covers the complete setup for connecting your deployed frontend and backend in production.

## 🎯 Deployment URLs

- **Frontend:** https://edureachapp.com
- **Backend API:** https://api.edureachapp.com/api

---

## 📋 Table of Contents

1. [Frontend Production Configuration](#frontend-production-configuration)
2. [Backend CORS Configuration](#backend-cors-configuration)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Build and Deploy Process](#build-and-deploy-process)
5. [Verification Steps](#verification-steps)
6. [Troubleshooting](#troubleshooting)

---

## 🖥️ Frontend Production Configuration

### Step 1: Create Production Environment File

Create `.env.production` file in your `project` folder:

```bash
cd school_webiste/school_webiste/school_webiste/project
```

Create the file:

```env
VITE_API_BASE_URL=https://api.edureachapp.com/api
```

**Important:** 
- This file should NOT be committed to Git (already in `.gitignore`)
- Vite automatically uses this file when running `npm run build`

### Step 2: Verify Environment File

Check that `.env.production` exists and has the correct content:

```bash
cat .env.production
```

Should output:
```
VITE_API_BASE_URL=https://api.edureachapp.com/api
```

### Step 3: Build with Production Environment

```bash
npm run build
```

This will:
- Read `.env.production`
- Embed `VITE_API_BASE_URL` into the build
- Create optimized production files in `dist/` folder

---

## 🔧 Backend CORS Configuration

### Step 1: Set Backend Environment Variable

On your backend server, set the `FRONTEND_URL` environment variable:

```bash
# If using .env file
echo 'FRONTEND_URL=https://edureachapp.com,https://www.edureachapp.com' >> .env

# Or export directly
export FRONTEND_URL=https://edureachapp.com,https://www.edureachapp.com
```

### Step 2: Update Backend server.js

Ensure your backend `server.js` includes the frontend domain in CORS:

```javascript
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

// Add production frontend
if (!allowedOrigins.includes('https://edureachapp.com')) {
  allowedOrigins.push('https://edureachapp.com');
}
if (!allowedOrigins.includes('https://www.edureachapp.com')) {
  allowedOrigins.push('https://www.edureachapp.com');
}
```

### Step 3: Restart Backend Server

After updating CORS configuration:

```bash
# If using PM2
pm2 restart edureach-backend

# Or if using systemd
sudo systemctl restart edureach-backend

# Or manually
# Stop current process and restart
```

---

## 📝 Environment Variables Setup

### Frontend Environment Files

#### `.env.development` (Local Development)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

#### `.env.production` (Production Build)
```env
VITE_API_BASE_URL=https://api.edureachapp.com/api
```

### Backend Environment Variables

Create or update `.env` file in your backend directory:

```env
# Backend Configuration
NODE_ENV=production
PORT=5000

# Frontend URLs (for CORS)
FRONTEND_URL=https://edureachapp.com,https://www.edureachapp.com

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Other environment variables...
```

---

## 🚀 Build and Deploy Process

### Frontend Deployment

1. **Update Environment File:**
   ```bash
   cd /path/to/project
   echo "VITE_API_BASE_URL=https://api.edureachapp.com/api" > .env.production
   ```

2. **Build Production Version:**
   ```bash
   npm run build
   ```

3. **Verify Build:**
   ```bash
   # Check dist folder was created
   ls -la dist/
   
   # Check index.html contains correct API URL (should be embedded)
   grep -r "api.edureachapp.com" dist/ || echo "API URL embedded in build"
   ```

4. **Deploy to VPS:**
   ```bash
   # Using rsync
   rsync -avz --delete dist/ user@vps-ip:/var/www/edureach-frontend/
   
   # Or using Git
   git add .env.production
   git commit -m "Add production environment config"
   git push origin main
   
   # On VPS
   cd /var/www/edureach-frontend/project
   git pull origin main
   npm run build
   ```

5. **Set Permissions:**
   ```bash
   ssh user@vps-ip
   sudo chown -R www-data:www-data /var/www/edureach-frontend
   sudo chmod -R 755 /var/www/edureach-frontend
   ```

6. **Reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Backend Deployment

1. **Update Environment Variables:**
   ```bash
   cd /path/to/backend
   # Update .env file with FRONTEND_URL
   nano .env
   ```

2. **Restart Backend:**
   ```bash
   # Using PM2
   pm2 restart edureach-backend
   
   # Or systemd
   sudo systemctl restart edureach-backend
   ```

---

## ✅ Verification Steps

### 1. Check Frontend API Configuration

Open browser console on https://edureachapp.com and check:

```javascript
// Should log: 🔗 API Base URL: https://api.edureachapp.com/api
```

### 2. Test API Connection

In browser console:
```javascript
fetch('https://api.edureachapp.com/api')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Should return:
```json
{
  "success": true,
  "message": "EduReach Backend API is running",
  "version": "1.0.0"
}
```

### 3. Test Frontend-Backend Connection

1. Go to https://edureachapp.com
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to load any page that makes API calls
5. Check that requests go to `https://api.edureachapp.com/api/...`
6. Verify no `localhost:5000` requests

### 4. Check CORS Headers

In browser console:
```javascript
fetch('https://api.edureachapp.com/api/auth/profile', {
  credentials: 'include'
})
.then(r => {
  console.log('CORS Headers:', {
    'Access-Control-Allow-Origin': r.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Credentials': r.headers.get('Access-Control-Allow-Credentials')
  });
})
.catch(console.error);
```

---

## 🔍 Troubleshooting

### Issue: Frontend still calling localhost:5000

**Solution:**
1. Verify `.env.production` exists and has correct URL
2. Rebuild: `npm run build`
3. Clear browser cache
4. Check build output: `grep -r "localhost" dist/` (should return nothing)

### Issue: CORS errors in browser console

**Error:** `Access to fetch at 'https://api.edureachapp.com/api/...' from origin 'https://edureachapp.com' has been blocked by CORS policy`

**Solution:**
1. Check backend `FRONTEND_URL` environment variable includes `https://edureachapp.com`
2. Restart backend server
3. Check backend logs for CORS warnings
4. Verify backend CORS configuration in `server.js`

### Issue: 401/403 errors on API calls

**Possible Causes:**
1. Cookies not being sent (check `withCredentials: true` in axios config)
2. Backend not accepting credentials from frontend domain
3. Session expired

**Solution:**
1. Check browser DevTools → Application → Cookies
2. Verify cookies are being set for `edureachapp.com`
3. Check backend cookie settings (sameSite, secure, domain)

### Issue: API calls failing with network errors

**Check:**
1. Backend server is running: `curl https://api.edureachapp.com/api`
2. SSL certificate is valid
3. Firewall allows HTTPS (port 443)
4. Backend logs for errors

### Issue: Environment variables not working

**For Frontend:**
- Vite only reads variables prefixed with `VITE_`
- Must rebuild after changing `.env.production`
- Check build output for embedded values

**For Backend:**
- Restart server after changing `.env`
- Verify `.env` file is in correct location
- Check environment variables are loaded: `console.log(process.env.FRONTEND_URL)`

---

## 📋 Quick Reference Checklist

### Frontend
- [ ] `.env.production` file created with `VITE_API_BASE_URL=https://api.edureachapp.com/api`
- [ ] Built with `npm run build`
- [ ] Deployed `dist/` folder to VPS
- [ ] Nginx configured and reloaded
- [ ] Browser console shows correct API URL

### Backend
- [ ] `FRONTEND_URL` environment variable set
- [ ] CORS configuration updated in `server.js`
- [ ] Backend server restarted
- [ ] Backend accessible at https://api.edureachapp.com/api
- [ ] CORS headers include frontend domain

### Testing
- [ ] Frontend loads without errors
- [ ] API calls go to `api.edureachapp.com`
- [ ] No CORS errors in console
- [ ] Login/authentication works
- [ ] Data loads correctly

---

## 🔐 Security Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use HTTPS** - Both frontend and backend should use SSL
3. **Secure Cookies** - Backend should set `secure: true` in production
4. **CORS** - Only allow your frontend domain, not `*`
5. **Environment Variables** - Keep secrets secure, use environment variables

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs
3. Verify environment variables
4. Test API endpoints directly with curl/Postman
5. Check network tab in DevTools

---

## 🎉 Success Indicators

Your deployment is successful when:

✅ Frontend loads at https://edureachapp.com  
✅ No console errors about `localhost:5000`  
✅ API calls go to `https://api.edureachapp.com/api`  
✅ No CORS errors  
✅ Login and data loading works correctly  
✅ Cookies are set and sent properly  

---

**Last Updated:** December 2025  
**Version:** 1.0.0

