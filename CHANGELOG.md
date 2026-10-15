# Changelog — Premium upgrade

## Audit summary

| Item | Status |
|------|--------|
| Framework | Static HTML/CSS/JS (no SPA framework) |
| Entry | `index.html` + city landing pages |
| Forms | `#quoteForm` → WhatsApp via `script.js` |
| WA number | `918607227219` (correct) |
| Phone | `tel:+918607227219` (correct) |
| Email | `anujzirakpur@gmail.com` |
| Deploy | Vercel static (`vercel.json` cleanUrls) |
| JS syntax | `node --check script.js` passes |

## Bugs found & fixed

1. **Footer logo invisible** on dark navy — fixed with light logo + text brand name  
2. **Broken SearchAction** schema pointing to non-existent `/search` — removed  
3. **og:image** pointed to missing `og-image.jpg` — temporarily uses logo SVG  
4. **Photos too tall on mobile** — height caps + gallery reduced to 4 items  
5. **Excessive mobile scroll** — tighter section padding, compact gallery  
6. **Favicon** — proper square mark added on all pages  
7. **Keyboard focus** — `:focus-visible` outlines added  
8. **Horizontal overflow risk** — `overflow-x: clip` on html/body  

## Design improvements

- Premium navy / red / gold / teal theme  
- Plus Jakarta Sans + Work Sans typography  
- Polished sticky header with glass effect  
- Readable footer with Contact + Quick links columns  
- Compact branded visuals (VERIFIED on truck/shirts)  
- Subtle scroll reveals + hover (respects reduced-motion)  
- Mobile call bar + floating WhatsApp positioned safely  

## SEO improvements

- MovingCompany LocalBusiness-style JSON-LD on homepage  
- Unique titles/canonicals retained on city pages  
- Sitemap + robots.txt verified  
- Descriptive image alt text on gallery  

## Files changed (high level)

- `styles.css` — theme, mobile, a11y, footer/header  
- `script.js` — reveal targets (forms unchanged)  
- `index.html` + all city pages — gallery, footer brand, favicon  
- `assets/` — favicon, branded SVGs, light logo  
- `DEPLOY.md`, `CHANGELOG.md` — new  

## Preserved (not broken)

- All WhatsApp form flows  
- All `tel:` links  
- City page URLs  
- Vendor signup WhatsApp flow  
- Vercel config  
- Business identity and contact details  

## Manual tasks remaining

1. Upload real photos / `og-image.jpg` when ready  
2. Add Google Ads / GA4 tags when you have IDs  
3. Verify domain in Google Search Console and submit sitemap  
4. Optional: replace SVG illustrations with WebP photos  

## Tests performed

| Test | Result |
|------|--------|
| `node --check script.js` | Pass |
| WA number / tel links present | Pass |
| Favicon on HTML pages | Pass |
| Footer brand text present | Pass |
| Gallery compact (4 items) | Pass |
| Live browser / Vercel deploy | Not run in this environment — do after push |
| Real device WhatsApp open | Manual test on your phone after deploy |
