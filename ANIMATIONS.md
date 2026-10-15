# Full-site animation system

## Principles
- Intentional motion, not constant noise
- CSS transform/opacity only (GPU-friendly)
- IntersectionObserver once-per-element reveals
- `prefers-reduced-motion` disables decorative motion
- Forms, WhatsApp, and clicks never blocked

## Techniques
1. **Page enter** — body + nav fade/slide in (~0.5s), no blocking preloader
2. **Scroll reveals** — up / left / right staggered entrance on cards, sections, FAQ, forms, footer
3. **Hero** — eyebrow, headline, sub, visual staggered via reveals
4. **Images** — float, pulse, Ken Burns, truck LTR (existing)
5. **Buttons** — hover lift, active scale
6. **Cards** — hover elevation
7. **WA float + mobile bar** — delayed entrance after page load
8. **Page-specific** — quote card pop, city slip slide, contact tile stagger

## Pages covered
All HTML routes: home, about, contact, quote, all-cities, vendor, 17 city landings.

## Files
- `script.js` — `initMotionSystem`
- `styles.css` — motion system + image/truck animations

## Extra motion pass (October 2026)
- Animated road markings underneath existing truck routes.
- Lightweight CSS parcel drift and route-trace accents on service, local-area, About, and Contact heroes.
- Hover-only icon nudges and button highlight sweeps.
- Hover lift for service and location cards.
- New effects respect `prefers-reduced-motion` and are hidden/reduced on narrow screens where they could collide with content.
