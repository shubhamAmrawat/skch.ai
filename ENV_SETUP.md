# 🔐 Environment Variables Setup Guide

## Quick Answer

**For Local Development:** Create `.env.local` files  
**For Production:** Set variables in Vercel/Render dashboards (NO files needed)

---

## 📁 Local Development Setup

### Step 1: Create Frontend Environment File

Create `Client/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AUTH_API_BASE_URL=http://localhost:3000/api/auth
```

### Step 2: Create Backend Environment File

Create `Server/.env`:

```env
PORT=3000
NODE_ENV=development
DB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sktch-ai?retryWrites=true&w=majority
JWT_SECRET=your_random_32_character_secret_key_here
OPENAI_API_KEY=sk-your-openai-api-key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ALLOWED_ORIGINS=http://localhost:5173
```

### Step 3: Restart Your Dev Servers

After creating these files:
- Stop your frontend/backend servers (Ctrl+C)
- Start them again
- The environment variables will now be loaded

---

## ☁️ Production Setup (Vercel & Render)

### ❌ DO NOT Create .env Files for Production

Instead, set environment variables in the dashboards:

### Frontend (Vercel)
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
   - `VITE_AUTH_API_BASE_URL` = `https://your-backend.onrender.com/api/auth`

### Backend (Render)
1. Go to your Render service
2. Environment tab
3. Add all variables from `Server/.env` (but with production values)

---

## 📝 File Priority (Vite)

Vite loads environment files in this order (highest priority first):

1. `.env.local` ← **Use this for local development**
2. `.env.development` (only in dev mode)
3. `.env.production` (only in build mode)
4. `.env` (lowest priority)

**Recommendation:** Use `.env.local` for local dev (it's gitignored and won't be committed)

---

## ✅ Checklist

### Local Development
- [ ] Created `Client/.env.local`
- [ ] Created `Server/.env`
- [ ] Restarted dev servers
- [ ] Tested that API calls work

### Production
- [ ] Set variables in Vercel dashboard (frontend)
- [ ] Set variables in Render dashboard (backend)
- [ ] Updated `ALLOWED_ORIGINS` with production URL
- [ ] Tested production deployment

---

## 🔒 Security Notes

- ✅ `.env.local` and `.env` are already in `.gitignore` (safe)
- ✅ Never commit environment files to Git
- ✅ Never share your `.env` files
- ✅ Use different values for development vs production
- ✅ Rotate secrets regularly in production

---

## 🆘 Troubleshooting

**Problem:** Environment variables not working locally
- **Solution:** Make sure file is named exactly `.env.local` (not `.env.local.txt`)
- **Solution:** Restart your dev server after creating the file
- **Solution:** Check file is in the correct directory (`Client/` or `Server/`)

**Problem:** Production not using environment variables
- **Solution:** Variables must be set in Vercel/Render dashboards
- **Solution:** Redeploy after adding variables
- **Solution:** Check variable names match exactly (case-sensitive)

---

## 📚 Summary

| Environment | File Needed? | Where? |
|------------|--------------|--------|
| **Local Dev** | ✅ Yes | `Client/.env.local` and `Server/.env` |
| **Production** | ❌ No | Set in Vercel/Render dashboards |

**That's it!** Create `.env.local` for local development, and set variables in dashboards for production.

