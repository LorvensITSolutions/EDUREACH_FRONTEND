# Connecting Frontend to Production Backend

## ✅ Changes Made

1. **Updated `src/components/lib/axios.js`**
   - Now uses environment variable `VITE_API_BASE_URL`
   - Automatically switches between development and production

2. **Fixed hardcoded localhost URLs**
   - Updated `AssignmentSubmissions.jsx` to use environment variable
   - Updated `StudentAssignmentsPage.jsx` to use environment variable

3. **Backend CORS Configuration**
   - Updated to accept frontend URLs from environment variable
   - Supports multiple frontend domains

---

## 🚀 Setup Steps

### Step 1: Create Frontend Environment Files

Create these files in your `project` folder:

#### `.env.development` (for `npm run dev`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

#### `.env.production` (for `npm run build`)
```env
VITE_API_BASE_URL=https://api.edureachapp.com/api
```

**How to create:**
1. Navigate to the `project` folder
2. Create a new file named `.env.development`
3. Add the content above
4. Create another file named `.env.production`
5. Add the production content above

---

### Step 2: Update Backend .env on VPS

SSH into your VPS server and edit the backend `.env` file:

```bash
ssh your-username@api.edureachapp.com
cd /path/to/your/backend
nano .env
```

Add or update this line (replace with your actual frontend domain):

```env
FRONTEND_URL=http://localhost:5173,https://your-frontend-domain.com
```

**Example:**
```env
FRONTEND_URL=http://localhost:5173,https://edureachapp.com
```

**If you don't know your frontend domain yet:**
- For now, you can use: `FRONTEND_URL=http://localhost:5173,https://api.edureachapp.com`
- Update it later when you deploy your frontend

Save and exit (`Ctrl+X`, then `Y`, then `Enter`)

---

### Step 3: Restart Backend Server

```bash
# If using PM2
pm2 restart all

# If using systemd
sudo systemctl restart your-service-name

# If running with node directly
# Stop (Ctrl+C) and restart:
npm start
```

---

### Step 4: Test the Connection

#### Test Backend API:
```bash
curl https://api.edureachapp.com/api
```

Should return:
```json
{"success":true,"message":"EduReach Backend API is running","version":"1.0.0"}
```

#### Test from Frontend:

**For Development:**
1. Make sure `.env.development` exists with `VITE_API_BASE_URL=http://localhost:5000/api`
2. Run `npm run dev`
3. The frontend will connect to `localhost:5000` (your local backend)

**For Production Build:**
1. Make sure `.env.production` exists with `VITE_API_BASE_URL=https://api.edureachapp.com/api`
2. Run `npm run build`
3. Deploy the build folder
4. The frontend will connect to `https://api.edureachapp.com/api`

---

## 🔍 Troubleshooting

### Issue: CORS errors in browser console

**Solution:**
1. Make sure `FRONTEND_URL` in backend `.env` includes your frontend domain
2. Restart backend server after changing `.env`
3. Check browser console for the exact error message

### Issue: Frontend still connecting to localhost

**Solution:**
1. Make sure `.env.production` file exists and has correct URL
2. Run `npm run build` (not `npm run dev`)
3. Clear browser cache
4. Restart your development server if testing locally

### Issue: 404 errors when calling API

**Solution:**
1. Check that your API URL is correct: `https://api.edureachapp.com/api`
2. Test the API endpoint directly in browser: `https://api.edureachapp.com/api`
3. Make sure backend is running on the server

### Issue: Environment variables not working

**Solution:**
1. Vite requires `VITE_` prefix for environment variables
2. Restart dev server after creating/modifying `.env` files
3. Make sure `.env` files are in the `project` folder (same level as `package.json`)

---

## 📝 Summary

**Frontend:**
- ✅ Code updated to use environment variables
- ⚠️ **Action needed:** Create `.env.development` and `.env.production` files

**Backend:**
- ✅ CORS configuration updated
- ⚠️ **Action needed:** Add `FRONTEND_URL` to backend `.env` on VPS and restart server

---

## 🎯 Quick Checklist

- [ ] Create `.env.development` file in `project` folder
- [ ] Create `.env.production` file in `project` folder
- [ ] Add `FRONTEND_URL` to backend `.env` on VPS
- [ ] Restart backend server on VPS
- [ ] Test API connection: `curl https://api.edureachapp.com/api`
- [ ] Build frontend: `npm run build`
- [ ] Deploy frontend and test in browser

---

Once these steps are complete, your frontend will connect to `https://api.edureachapp.com/api` in production! 🎉

