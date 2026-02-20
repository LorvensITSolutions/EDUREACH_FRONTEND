# Update Production Environment Variable on VPS

## Quick Steps to Update `VITE_API_BASE_URL` on VPS Server

### Step 1: SSH into your VPS server
```bash
ssh your-username@your-vps-ip
```

### Step 2: Navigate to your frontend project directory
```bash
cd /var/www/edureach-frontend/project
# OR wherever your project is located
```

### Step 3: Create or Update `.env.production` file
```bash
# Replace with your actual production backend URL
echo "VITE_API_BASE_URL=https://your-backend-domain.com/api" > .env.production

# OR if your backend is on the same server but different port:
echo "VITE_API_BASE_URL=http://your-vps-ip:5000/api" > .env.production

# OR if using domain:
echo "VITE_API_BASE_URL=https://api.yourdomain.com/api" > .env.production
```

**Example:**
```bash
# If your backend is at https://api.edureachapp.com
echo "VITE_API_BASE_URL=https://api.edureachapp.com/api" > .env.production

# If your backend is at http://your-vps-ip:5000
echo "VITE_API_BASE_URL=http://123.456.789.0:5000/api" > .env.production
```

### Step 4: Verify the file was created correctly
```bash
cat .env.production
```

You should see:
```
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Step 5: Rebuild the frontend (IMPORTANT!)
```bash
# Make sure you're in the project directory
cd /var/www/edureach-frontend/project

# Install dependencies if needed
npm install

# Build with production environment
npm run build
```

### Step 6: Copy the new build to nginx directory
```bash
# Find your nginx root directory
sudo grep -r "root " /etc/nginx/sites-enabled/* | grep -v "#" | head -1

# Usually it's something like:
# /var/www/edureach-frontend
# OR
# /var/www/html

# Copy the new build (replace with your actual nginx root)
sudo cp -r dist/* /var/www/edureach-frontend/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/edureach-frontend
sudo chmod -R 755 /var/www/edureach-frontend
```

### Step 7: Reload nginx
```bash
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### Step 8: Clear browser cache
- Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Or open DevTools → Network tab → Check "Disable cache"

---

## One-Line Script (Quick Update)

If you know your backend URL, you can run this all at once:

```bash
cd /var/www/edureach-frontend/project && \
echo "VITE_API_BASE_URL=https://your-backend-domain.com/api" > .env.production && \
npm run build && \
sudo cp -r dist/* /var/www/edureach-frontend/ && \
sudo chown -R www-data:www-data /var/www/edureach-frontend && \
sudo systemctl reload nginx
```

**Replace `https://your-backend-domain.com/api` with your actual backend URL!**

---

## Common Production URLs

### If backend is on same server, different port:
```bash
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env.production
# OR if accessing from outside:
echo "VITE_API_BASE_URL=http://your-vps-ip:5000/api" > .env.production
```

### If backend has a domain:
```bash
echo "VITE_API_BASE_URL=https://api.yourdomain.com/api" > .env.production
```

### If backend is behind reverse proxy:
```bash
echo "VITE_API_BASE_URL=https://yourdomain.com/api" > .env.production
```

---

## Verify It's Working

1. **Check the built files:**
   ```bash
   # The env variable should be embedded in the built JS files
   grep -r "VITE_API_BASE_URL" dist/
   ```

2. **Check browser console:**
   - Open your website
   - Open DevTools (F12)
   - Go to Network tab
   - Check API calls - they should go to your production backend URL

3. **Test an API call:**
   - Try logging in or any API action
   - Check Network tab to see if requests go to correct URL

---

## Troubleshooting

### Issue: Still connecting to localhost:5000
**Solution:** 
- Make sure you rebuilt after updating `.env.production`
- Clear browser cache
- Check that `.env.production` has correct URL (no typos)

### Issue: CORS errors
**Solution:**
- Make sure your backend CORS is configured to allow your frontend domain
- Check backend `FRONTEND_URL` environment variable

### Issue: 401/403 errors
**Solution:**
- Check if backend is running
- Verify backend URL is correct
- Check backend authentication middleware

### Issue: Build fails
**Solution:**
```bash
# Check for errors
npm run build 2>&1 | tee build.log

# Make sure .env.production exists
ls -la .env.production

# Check file contents
cat .env.production
```

---

## Important Notes

1. **Vite env variables are baked at build time** - You MUST rebuild after changing `.env.production`
2. **Use `.env.production` for production builds** - Vite automatically uses this when you run `npm run build`
3. **Don't commit `.env.production` to git** - It should be in `.gitignore`
4. **Always test after updating** - Check browser console and network requests

---

## Quick Reference

```bash
# 1. Update env file
echo "VITE_API_BASE_URL=https://your-backend.com/api" > .env.production

# 2. Rebuild
npm run build

# 3. Deploy
sudo cp -r dist/* /var/www/edureach-frontend/
sudo systemctl reload nginx

# 4. Clear cache (in browser)
Ctrl + Shift + R
```


