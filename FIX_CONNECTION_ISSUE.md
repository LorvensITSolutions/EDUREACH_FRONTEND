# Fix Connection Issue - Quick Guide

## ✅ What I Did

I created the `.env.development` file with:
```
VITE_API_BASE_URL=https://api.edureachapp.com/api
```

## ⚠️ IMPORTANT: Restart Your Dev Server

**Vite only loads environment variables when the server starts!**

### Steps to Fix:

1. **Stop your current dev server** (press `Ctrl+C` in the terminal where `npm run dev` is running)

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Check the browser console** - you should now see:
   ```
   🔗 API Base URL: https://api.edureachapp.com/api
   ```

4. **Try logging in again** - it should now connect to your production backend!

---

## 🔍 Verification

After restarting, open your browser console and you should see:
- ✅ `🔗 API Base URL: https://api.edureachapp.com/api` (not localhost:5000)
- ✅ API calls should go to `https://api.edureachapp.com/api/auth/login`

If you still see `localhost:5000`, it means:
- The dev server wasn't restarted
- Or the `.env.development` file is in the wrong location

---

## 📁 File Location

Make sure `.env.development` is in:
```
c:\Users\Harshitha\Downloads\school_webiste\school_webiste\school_webiste\project\.env.development
```

Same folder as `package.json`, `vite.config.js`, etc.

---

## 🎯 Quick Checklist

- [x] `.env.development` file created with production API URL
- [ ] **Stop dev server (Ctrl+C)**
- [ ] **Restart dev server (`npm run dev`)**
- [ ] Check browser console for the API URL log
- [ ] Try logging in again

---

**The key step is restarting the dev server!** Environment variables are only loaded when Vite starts.

