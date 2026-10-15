# Website update — conversion, trust, performance and local SEO

This update was applied to the existing static HTML/CSS/JavaScript project.

## Included changes

1. **Progressive multi-step quote flow:** the 19 full quote forms now show contact details, move details, and schedule/extras as three steps. It progressively enhances the existing fields and leaves the original submit/WhatsApp logic in control of final submission. If JavaScript is unavailable, the original form markup remains the fallback.
2. **Conversion analytics hooks:** `script.js` pushes non-sensitive events to `window.dataLayer` for phone clicks, WhatsApp clicks, quote steps, and quote requests prepared for WhatsApp. It does not send customer names, phone numbers, or form values to analytics, and it does not claim that WhatsApp messages were sent.
3. **Honest feedback section:** homepage feedback CTA invites feedback through WhatsApp. It deliberately displays no fabricated testimonials, stars, customer names or review counts. For a Google review CTA, add the verified Google Business Profile review URL when available.
4. **Image/performance improvements:** local images receive async decoding, intrinsic dimensions where discoverable, and lazy-loading for non-brand/non-first content images. Brand logos remain eager. Google Fonts gets a `fonts.gstatic.com` preconnect where relevant.
5. **Technical/local SEO:** missing canonical and Open Graph URL metadata is added; `twitter:card` is added where absent; pages without breadcrumb schema now receive a valid two-level BreadcrumbList; the sitemap includes all current HTML pages and records a current last-modified date; `robots.txt` retains its sitemap declaration.
6. **Visual gallery:** the existing homepage illustration gallery now includes office-moving and box/packing visuals, with copy clearly identifying them as illustrations rather than claiming they are real customer job photos.
7. **Trust/transparency checklist:** homepage now provides a practical pre-booking checklist covering itemised pricing, packing scope, site access, transit protection, and independent provider status.
8. **QA artifacts:** `WEBSITE-QA-REPORT.md` documents static checks and any manual tasks still required.

## Google Ads / GTM setup required

No Google Ads conversion ID or GTM container ID was present in the project, so none has been invented or injected. The event hooks can still be used by Google Tag Manager through `dataLayer`.

- `vmp_phone_click`: a tap/click on a telephone link (not proof that a call connected).
- `vmp_whatsapp_click`: a click on a WhatsApp link (not proof that a message was sent).
- `vmp_quote_step_completed`: a step of the quote form was completed.
- `vmp_quote_request_ready`: valid quote details were prepared and WhatsApp was opened/attempted (not proof of sending).
- `vmp_feedback_click`: the feedback WhatsApp CTA was clicked.

To send Google Ads conversions directly through `gtag`, first install/configure the official Google tag or GTM container. Then set the exact `AW-ID/LABEL` values provided by Google in the `window.VMP_ANALYTICS_CONFIG.googleAds` defaults near the end of `script.js`:

- `callClickSendTo`
- `whatsappClickSendTo`
- `quoteReadySendTo`

Use only actual values from your Google Ads account. Avoid counting both `vmp_whatsapp_click` and `vmp_quote_request_ready` as primary conversions unless you intend to count two different lead-intent actions. WhatsApp cannot reliably report back whether the visitor pressed Send.

## Customer reviews

The website has not been given a verified public review feed or Google review URL. This version intentionally avoids fabricated reviews. Supply the real Google Business Profile review link and customer-approved review text before displaying actual reviews or adding rating schema.

## Before deploying

1. Keep the previous ZIP as a backup.
2. Run `npm run check` in the `Verified` folder.
3. Open `index.html`, `quote.html`, and a city page locally.
4. Test wizard validation, step back/continue, final WhatsApp opening, `tel:` links, and mobile sticky-contact controls.
5. Add your actual Google Tag Manager/Google Ads identifiers before expecting account-level conversions.
6. Deploy only after you confirm the new flow visually in a browser on desktop and mobile.
