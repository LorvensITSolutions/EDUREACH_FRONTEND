# Environment Variables Setup Guide

## Frontend Environment Variables

Create these files in the `project` folder:

### `.env.development` (for local development)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### `.env.production` (for production build)
```env
VITE_API_BASE_URL=https://api.edureachapp.com/api
```

## How to Create These Files

1. **For Development:**
   - Create a file named `.env.development` in the `project` folder
   - Add: `VITE_API_BASE_URL=http://localhost:5000/api`

2. **For Production:**
   - Create a file named `.env.production` in the `project` folder
   - Add: `VITE_API_BASE_URL=https://api.edureachapp.com/api`

## Important Notes

- Vite automatically uses `.env.development` when running `npm run dev`
- Vite automatically uses `.env.production` when running `npm run build`
- Make sure these files are in `.gitignore` (they usually are by default)
- Restart your dev server after creating/modifying these files

## Verification

After setting up, your frontend will:
- In development: Connect to `http://localhost:5000/api`
- In production: Connect to `https://api.edureachapp.com/api`

