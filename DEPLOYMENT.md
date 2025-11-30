# 🚀 Deployment Guide for sktch.ai

Complete step-by-step guide to deploy your full-stack application to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Database Setup (MongoDB Atlas)](#phase-1-database-setup-mongodb-atlas)
3. [Phase 2: Backend Deployment (Render)](#phase-2-backend-deployment-render)
4. [Phase 3: Frontend Deployment (Vercel)](#phase-3-frontend-deployment-vercel)
5. [Phase 4: Environment Variables](#phase-4-environment-variables)
6. [Phase 5: Testing & Verification](#phase-5-testing--verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account with your code pushed
- MongoDB Atlas account (free tier available)
- Render account (free tier available)
- Vercel account (free tier available)
- Cloudinary account (free tier available)
- OpenAI API key

---

## Phase 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new organization (or use default)

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose **FREE (M0)** tier
3. Select a cloud provider and region (choose closest to your users)
4. Name your cluster (e.g., "sktch-ai-cluster")
5. Click "Create"

### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and strong password (save these!)
5. Set user privileges to "Atlas admin" (or "Read and write to any database")
6. Click "Add User"

### Step 4: Whitelist IP Address
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for now - you can restrict later)
   - Or add `0.0.0.0/0` manually
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "5.5 or later"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `sktch-ai` (or your preferred database name)

**Example:**
```
mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/sktch-ai?retryWrites=true&w=majority
```

**Save this connection string - you'll need it for Render!**

---

## Phase 2: Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended)

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your repository

### Step 3: Configure Service
Fill in the following:

- **Name:** `sktch-ai-backend` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `main` (or your default branch)
- **Root Directory:** `Server`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Step 4: Add Environment Variables
Click "Add Environment Variable" and add these one by one:

```
PORT=3000
NODE_ENV=production
DB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=generate_a_random_32_char_string
OPENAI_API_KEY=sk-your-openai-api-key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ALLOWED_ORIGINS=http://localhost:5173
```

**Important Notes:**
- Generate `JWT_SECRET` using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- For `ALLOWED_ORIGINS`, you'll update this after getting your Vercel URL
- Keep `http://localhost:5173` for local development testing

### Step 5: Deploy
1. Click "Create Web Service"
2. Render will start building and deploying
3. Wait for deployment to complete (usually 2-5 minutes)
4. Once deployed, you'll get a URL like: `https://sktch-ai-backend.onrender.com`

**⚠️ Important:** Render free tier services spin down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds. Consider upgrading to paid plan for production.

### Step 6: Test Backend
1. Visit: `https://your-backend.onrender.com`
2. You should see the API info JSON
3. Test health endpoint: `https://your-backend.onrender.com/api/health`

**Save your backend URL - you'll need it for frontend!**

---

## Phase 3: Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Select your repository

### Step 3: Configure Project
Fill in the following:

- **Framework Preset:** `Vite`
- **Root Directory:** `Client`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_AUTH_API_BASE_URL=https://your-backend.onrender.com/api/auth
```

**Replace `your-backend.onrender.com` with your actual Render backend URL!**

### Step 5: Deploy
1. Click "Deploy"
2. Vercel will build and deploy (usually 1-2 minutes)
3. Once deployed, you'll get a URL like: `https://sktch-ai.vercel.app`

**Save your frontend URL!**

---

## Phase 4: Environment Variables

### Update Backend CORS (Render)
1. Go back to Render dashboard
2. Open your web service
3. Go to "Environment" tab
4. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
   ```
5. Click "Save Changes"
6. Render will automatically redeploy

### Verify All Environment Variables

**Backend (Render):**
- ✅ `PORT=3000`
- ✅ `NODE_ENV=production`
- ✅ `DB_URI` (MongoDB Atlas connection string)
- ✅ `JWT_SECRET` (random 32+ char string)
- ✅ `OPENAI_API_KEY`
- ✅ `CLOUDINARY_CLOUD_NAME`
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`
- ✅ `ALLOWED_ORIGINS` (includes Vercel URL)

**Frontend (Vercel):**
- ✅ `VITE_API_BASE_URL` (Render backend URL)
- ✅ `VITE_AUTH_API_BASE_URL` (Render backend URL)

---

## Phase 5: Testing & Verification

### Test Checklist

1. **Landing Page**
   - [ ] Visit your Vercel URL
   - [ ] Page loads correctly
   - [ ] No console errors

2. **Authentication**
   - [ ] Sign up works
   - [ ] Login works
   - [ ] User avatar appears (auto-generated)
   - [ ] Logout works

3. **UI Generation**
   - [ ] Can draw on canvas
   - [ ] "Generate UI" works
   - [ ] Preview shows generated code
   - [ ] Code tab displays correctly

4. **Profile**
   - [ ] Profile page loads
   - [ ] Can update name
   - [ ] Can upload avatar (Cloudinary)
   - [ ] Can change password

5. **API Health**
   - [ ] Backend health endpoint works
   - [ ] No CORS errors in console

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem:** Browser shows CORS errors
**Solution:**
- Check `ALLOWED_ORIGINS` in Render includes your Vercel URL
- Ensure no trailing slashes in URLs
- Verify frontend environment variables are correct

#### 2. Database Connection Failed
**Problem:** Backend can't connect to MongoDB
**Solution:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user password is correct
- Verify network access in MongoDB Atlas

#### 3. Environment Variables Not Working
**Problem:** Frontend still using localhost URLs
**Solution:**
- Vercel: Check environment variables are set correctly
- Redeploy after adding variables
- Clear browser cache
- Check browser console for actual API calls

#### 4. Render Service Spinning Down
**Problem:** First request takes 30+ seconds
**Solution:**
- This is normal for free tier
- Consider upgrading to paid plan ($7/month)
- Or use a service like UptimeRobot to ping your backend every 5 minutes

#### 5. Build Failures
**Problem:** Deployment fails
**Solution:**
- Check build logs in Render/Vercel
- Verify Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

#### 6. Avatar Upload Not Working
**Problem:** Cloudinary upload fails
**Solution:**
- Verify Cloudinary credentials in Render
- Check Cloudinary dashboard for uploads
- Verify file size limits (5MB max)

---

## Production Best Practices

### Security
- ✅ Use strong, unique `JWT_SECRET`
- ✅ Never commit `.env` files
- ✅ Use HTTPS only (Vercel/Render provide this)
- ✅ Regularly rotate API keys
- ✅ Monitor for suspicious activity

### Performance
- ✅ Enable caching where appropriate
- ✅ Optimize images (Cloudinary helps)
- ✅ Monitor API response times
- ✅ Set up error tracking (Sentry)

### Monitoring
- ✅ Set up uptime monitoring
- ✅ Monitor API usage
- ✅ Track error rates
- ✅ Set up alerts for downtime

### Scaling
- ✅ Monitor database usage (MongoDB Atlas)
- ✅ Watch API rate limits (OpenAI)
- ✅ Monitor Cloudinary bandwidth
- ✅ Plan for traffic spikes

---

## Cost Estimation (Free Tier)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Vercel** | 100GB bandwidth/month | $20/month (Pro) |
| **Render** | Services spin down after 15min | $7/month (Starter) |
| **MongoDB Atlas** | 512MB storage | $9/month (M10) |
| **Cloudinary** | 25GB storage, 25GB bandwidth | $89/month (Plus) |
| **OpenAI** | Pay per use | Pay per use |

**Total Free Tier:** $0/month (with limitations)
**Recommended Paid:** ~$25-30/month for production

---

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Add analytics (Google Analytics, Plausible)
3. ✅ Set up error tracking (Sentry)
4. ✅ Configure monitoring (UptimeRobot)
5. ✅ Set up CI/CD (already done with GitHub)
6. ✅ Add rate limiting (already configured)
7. ✅ Set up backups (MongoDB Atlas provides)

---

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Render/Vercel logs
3. Check browser console for errors
4. Verify all environment variables
5. Test endpoints individually

---

**🎉 Congratulations! Your app is now live in production!**

