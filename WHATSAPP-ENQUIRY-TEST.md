# WhatsApp enquiry — how it works & how to test

## Important truth

**WhatsApp does NOT send the message automatically.**

What the website does:

1. You fill the form and tap **Send details to WhatsApp**
2. The site builds a text message with your fields
3. It opens: `https://wa.me/918607227219?text=...` (your business number)
4. WhatsApp app or WhatsApp Web opens with the message **already typed**
5. **You must press Send** in WhatsApp

This is normal for every website that is not using the official WhatsApp Business API (paid).  
Your form **does** create a **real enquiry** — once the customer presses Send, it arrives on **+91 86072 27219**.

## Number used (verified in code)

- WhatsApp API link: `918607227219`
- Display: `+91 86072 27219`
- Call link: `tel:+918607227219`

## Message example (what you receive)

```
📦 NEW QUOTE REQUEST
━━━━━━━━━━━━━━━━━━━━
Reference: VMP-12345
Page: Reliable packers & movers in Zirakpur...
Customer: Anuj Sharma
WhatsApp/Mobile: 9876543210
Email: ...
Pickup: VIP Road, Zirakpur
Drop: Phase 7, Mohali
Move date: 20 Oct 2026
Move size: 2 BHK
Service: Full packing + loading + transport + unloading
Extra instructions: Lift available
━━━━━━━━━━━━━━━━━━━━
Verified Movers & Packers
Contact: +91 86072 27219 · anujzirakpur@gmail.com
```

## How to test on your phone (2 minutes)

1. Open https://verifiedmoversandpackers.world/quote.html (or homepage)
2. Fill name, **your own** mobile, pickup, drop, size, service, date
3. Tap **Send details to WhatsApp**
4. WhatsApp should open to chat with **86072 27219**
5. Check the prefilled text has your details
6. Press **Send**
7. Confirm the message appears in that WhatsApp account

### If WhatsApp does not open

- Allow pop-ups for the site once
- Use the green **Open WhatsApp again** button on the success screen
- Or use floating WhatsApp / Contact page buttons

### Direct test link (no form)

On your phone browser open:

`https://wa.me/918607227219?text=Test%20from%20website`

If that opens chat with your number, the number is correct.

## Pages that send enquiries

| Page | Method |
|------|--------|
| `index.html` | Full form → WhatsApp |
| `movers-in-*.html` | Full form → WhatsApp |
| `quote.html` | Dedicated quote form → WhatsApp |
| `contact.html` | Short form → WhatsApp |
| Header / float / mobile bar | Instant WhatsApp with short greeting |

All use the same number and `script.js`.
