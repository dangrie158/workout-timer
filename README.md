# Workout Timer

A mobile-first interval timer for HIIT, Tabata, and custom workouts.

## Setup
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy to GitHub Pages
This repository includes `.github/workflows/deploy.yml`, which builds and deploys the app automatically when you push to `main`.

Before the first release:
1. Push the repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` or run the workflow manually from the **Actions** tab.

The Vite base path is resolved automatically in GitHub Actions, so the same build setup works even if the repository name changes.
