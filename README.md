# CrystalTriage

A location-based social app with glassmorphism design and real-time features.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Frontend + API)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Deploy:
```bash
railway login
railway init
railway up
```

### Option 3: Render

1. Connect your GitHub repository to Render
2. Use these build settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### Option 4: Heroku

1. Install Heroku CLI
2. Deploy:
```bash
heroku create crystaltriage-app
git push heroku main
```

## 🏗️ Production Build

The app builds into a `dist` directory with:
- `dist/index.js` - Server bundle
- `dist/public/` - Client assets

## 🔧 Environment Variables

Create a `.env` file:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
```

## 📱 Features

- Real-time location-based posts
- Glassmorphism UI design
- Truth Mode verification
- GeoTime Capsules
- Challenge system
- Anonymous confessions

## 🎨 UI Enhancements

- Modern glassmorphism effects
- Smooth animations and transitions
- Mobile-first responsive design
- Dark mode support
- Interactive hover effects
- Gradient backgrounds
