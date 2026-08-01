# Workout Timer

A mobile-first interval timer for HIIT, Tabata, and custom workouts. Progressive Web App (PWA) compatible.

## Setup
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Install as App

### Android
1. Open the app in Chrome or any Chromium-based browser
2. Tap the **menu icon** (⋮) at the top right
3. Tap **"Install app"** or **"Add to Home screen"**

### iOS
1. Open the app in Safari
2. Tap the **Share button** (arrow up) at the bottom
3. Tap **"Add to Home Screen"**
4. Give it a name and tap **"Add"**

The app works offline and will cache your workout configurations locally. Service Worker automatically handles updates.

## Deploy to GitHub Pages
This repository includes `.github/workflows/deploy.yml`, which builds and deploys the app automatically when you push to `main`.

Before the first release:
1. Push the repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` or run the workflow manually from the **Actions** tab.

The Vite base path is resolved automatically in GitHub Actions, so the same build setup works even if the repository name changes.

## PWA Features
- **Offline Support**: Service Worker caches app shell for offline access
- **Installable**: Add to home screen on Android, iOS, and desktop browsers
- **Local Storage**: Workout configurations persist across sessions
- **Updates**: Checks for app updates every 60 seconds

