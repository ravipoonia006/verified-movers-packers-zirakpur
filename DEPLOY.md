# Verified Movers & Packers — Deploy & Run Guide

**Domain:** https://verifiedmoversandpackers.world  
**Phone:** +91 86072 27219  
**WhatsApp:** https://wa.me/918607227219  
**Email:** anujzirakpur@gmail.com  

## What this project is

Static HTML/CSS/JS lead-generation website.  
No build step. No backend. Forms open WhatsApp with a pre-filled message (customer must press Send).

## Run locally on Windows

1. Extract the ZIP to a folder, e.g. `C:\Verified`
2. Open that folder in File Explorer
3. Double-click `index.html` **or** use a local server:
   - Install [Node.js](https://nodejs.org/) (optional)
   - In PowerShell:
     ```powershell
     cd C:\Verified
     npx --yes serve -p 3000
     ```
   - Open http://localhost:3000
4. Test:
   - Homepage quote form → WhatsApp opens with details
   - Call buttons → dialer with +918607227219
   - City pages (e.g. `movers-in-zirakpur.html`) → same form behaviour
   - Mobile width (DevTools → phone) → bottom Call/WhatsApp bar visible

## Deploy to existing Vercel project

1. Copy/overwrite files into your existing Git repo folder (keep `.git`)
2. Review changes:
   ```powershell
   git status
   git diff --stat
   ```
3. Commit and push:
   ```powershell
   git add -A
   git commit -m "Premium mobile UX, SEO schema, favicon, compact visuals, a11y polish"
   git push
   ```
4. Wait for Vercel deployment (Dashboard → Deployments → Ready)
5. Hard-refresh the live site (Ctrl+Shift+R)

**Vercel settings (already correct for static):**
- Framework: Other
- Build command: empty
- Output directory: `.`
- `vercel.json` already has cleanUrls + no trailing slash

## Optional: Google Ads / Analytics (manual)

Do **not** invent tracking IDs. When you have them:

1. **Google Ads conversion** — add the tag in `<head>` of pages you advertise (or via GTM)
2. **Google Analytics 4** — same via GTM recommended
3. **Search Console** — verify domain, submit `https://verifiedmoversandpackers.world/sitemap.xml`

## Optional: Real photos & social preview

1. Generate photorealistic images (team in VERIFIED shirts + branded truck)
2. Save into `assets/` as WebP/JPG matching existing names
3. Update `src` from `.svg` to `.webp`/`.jpg` in HTML
4. Add `assets/og-image.jpg` (1200×630) and set:
   ```html
   <meta property="og:image" content="https://verifiedmoversandpackers.world/assets/og-image.jpg">
   ```

## Syntax check

```powershell
node --check script.js
```
