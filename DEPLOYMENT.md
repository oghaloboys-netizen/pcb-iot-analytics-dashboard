# Deployment Guide

This React + Vite application can be deployed to various hosting services. Here are the easiest options:

## Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (optional, but recommended):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   
   Or simply push to GitHub and connect your repository at [vercel.com](https://vercel.com)

3. **First-time setup**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite and configure everything
   - Click "Deploy"

**Vercel automatically:**
- Builds your app on every push
- Provides HTTPS
- Global CDN
- Free custom domain (or use vercel.app subdomain)
- Auto-deploys from GitHub

## Option 2: Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

   Or use the Netlify web interface:
   - Visit [netlify.com](https://netlify.com)
   - Sign up/login
   - Drag and drop the `dist` folder
   - Or connect GitHub repository for continuous deployment

**Netlify provides:**
- Free HTTPS
- Global CDN
- Free custom domain (or use netlify.app subdomain)
- Continuous deployment from GitHub

## Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts**:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Update vite.config.ts** (add base path):
   ```ts
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages** in repository settings

## Option 4: Cloudflare Pages

1. Visit [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign up/login
3. Connect GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Deploy

## Build Locally First

Before deploying, make sure the build works:
```bash
npm run build
```

The built files will be in the `dist` folder.

## Environment Variables

If you need environment variables:
- **Vercel**: Add them in Project Settings → Environment Variables
- **Netlify**: Add them in Site Settings → Build & Deploy → Environment
- **GitHub Pages**: Use GitHub Secrets (for Actions)

## Recommended: Vercel

For React/Vite apps, **Vercel is the easiest**:
- Zero configuration needed
- Automatic deployments
- Excellent performance
- Free tier is generous
- Great developer experience

Just connect your GitHub repository and it works!
