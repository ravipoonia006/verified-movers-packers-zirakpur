# Visible Homepage Quote Form Update

This update adds a full, visible quote request form on the homepage immediately after the hero. It complements rather than replaces the full-screen `Move Quote Request` modal.

## Included
- Visible quote form with contact, pickup, destination, move size, service, date, email, and notes fields.
- Live India date display (`DD/MM/YYYY`) beneath request reference `SS-00214`.
- Client-side validation for required fields, Indian mobile numbers, future/today move dates, and optional email.
- WhatsApp message prepared from the entered fields. Visitors must press Send in WhatsApp to submit it.
- A fallback link if a browser blocks opening WhatsApp in a new tab.
- Responsive glass styling, accessible labels/status text, visible focus states, and reduced-motion support.

## Preserved
- The existing full-screen quote modal and its form.
- Existing Call and WhatsApp buttons, links, placement, and contact dock.
- Existing 50 random theme definitions, navigation, animations, and page content outside the new homepage section.

## Files changed
- `index.html` — added the visible homepage quote form.
- `styles.css` — added its responsive glass styling.
- `script.js` — added an isolated handler for the new form; the existing modal form handler is unchanged.

The WhatsApp message is prefilled, not sent automatically. A visitor must press Send in WhatsApp.
