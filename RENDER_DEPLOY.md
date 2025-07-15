# 🎨 Render Deployment Guide for CrystalTriage

## Quick Deploy Steps

### Option 1: GitHub Integration (Recommended)

1. **Push your code to GitHub** (if not already done)
2. **Visit Render.com** and sign up/login
3. **Create a new Web Service**:
   - Connect your GitHub repository
   - Select the `CrystalTriage` repository
   - Configure the service:

### Render Configuration Settings:

```
Service Name: crystaltriage
Environment: Node.js
Region: Choose your preferred region
Branch: main

Build Command: npm run build
Start Command: npm start

Auto-Deploy: Yes (recommended)
```

### Environment Variables:

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url_here
```

### Option 2: Manual Deployment

If you prefer manual deployment:

1. Build the project: `npm run build`
2. Upload the built files to Render
3. Set the start command to: `npm start`

## Features Included:

✅ Production-optimized build
✅ Static asset serving
✅ API endpoints
✅ WebSocket support
✅ File upload handling
✅ Database integration ready

## Build Output:

- Client bundle: ~445KB (gzipped: ~136KB)
- CSS bundle: ~97KB (gzipped: ~16KB)
- Server bundle: ~41KB

## Post-Deployment:

1. Your app will be available at: `https://your-service-name.onrender.com`
2. Test the camera functionality
3. Verify posting works correctly
4. Check the beautiful glassmorphism UI

## Support:

- Render automatically handles SSL certificates
- Free tier available with some limitations
- Scales automatically based on traffic
- Built-in monitoring and logs

Happy deploying! 🚀
