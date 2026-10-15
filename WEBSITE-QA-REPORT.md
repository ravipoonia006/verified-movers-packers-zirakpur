# Website QA report — all eight upgrades

Date: 15 October 2026

## Implemented

1. **Three-step moving quote form** across the 19 full quote forms: contact details → move details → schedule/extras. Adds step progress, Back/Continue controls, step-specific validation and focus management. The pre-existing submit handler still creates the customer message and opens WhatsApp; fields are not sent to a backend.
2. **Lead-intent event hooks** for phone clicks, WhatsApp clicks, completed quote steps, quote requests prepared for WhatsApp, and feedback CTA clicks. Events are pushed to `window.dataLayer`. No names, mobile numbers, routes, email addresses, or other form values are added to analytics events.
3. **Customer feedback area** with a WhatsApp feedback link and explicit policy against publishing unverified reviews. No fake testimonials, ratings, customer identities, or review counts were added.
4. **Image performance/accessibility pass** for 314 image tags: all have alt attributes, width/height attributes, `decoding`, and `loading`; site logos are eager-loaded and one first meaningful image per page is prioritized. A preconnect for `fonts.gstatic.com` is added where Google Fonts is used.
5. **Technical/local SEO pass:** missing canonical and Open Graph URL tags were added, Twitter card metadata was added where absent, BreadcrumbList markup was added to pages that lacked it, and the XML sitemap now contains all 151 existing HTML routes. Existing page routes were retained. The sitemap now has 151 unique URLs and current `lastmod` entries.
6. **Extended homepage illustration gallery:** six cards total, including office moving and boxes/packing illustrations. The section describes these as illustrations, not actual customer-job photographs.
7. **Trust/transparency checklist:** added guidance to confirm itemised pricing, packing scope, access details, and transit-protection terms with the independent moving provider.
8. **Project-wide audit:** found and fixed a pre-existing trailing comma in the All Cities JSON-LD ItemList; added the missing Derabassi list item at position 6. Added these reports/setup notes.

## Automated/static checks

- `npm run check` — passed (`node --check script.js`).
- CSS top-level parse errors — 0.
- HTML files — 151 parsed.
- Image tags — 314; missing alt/dimensions/decoding/loading attributes — 0.
- Pages missing title, description, or canonical — 0.
- Canonical mismatches — 0.
- Duplicate HTML IDs — 0 pages.
- Invalid JSON-LD blocks — 0.
- Broken relative page/asset links — 0.
- Broken local fragment links — 0.
- Sitemap routes missing/extraneous/duplicate — 0; sitemap entries — 151.

## Browser smoke tests

A headless Chromium interaction test using the project's inline HTML/CSS/JavaScript passed:

- Three quote steps were created; only the first showed initially.
- Empty required fields were blocked with inline validation.
- Continue moved to steps 2 and 3.
- Back returned to the previous step and preserved entered values.
- Valid details showed the request-ready panel and produced a prefilled `https://wa.me/918607227219?...` URL.
- The `vmp_quote_request_ready` dataLayer event was recorded.
- No JavaScript page errors occurred during this test.

At a 390px mobile viewport, the existing bottom contact bar remained visible, the duplicate floating WhatsApp button was hidden, the header contact buttons were not duplicated, and document scroll width equalled viewport width (390px). No JavaScript page errors occurred in that test.

**Visual-testing limitation:** direct local-file/loopback navigation was blocked by the browser environment, so these smoke tests injected the source into a test document. That validates the interaction logic and basic layout metrics but does not certify the appearance of every page with all relative images/fonts loaded. Please make the final visual check locally or on a Vercel preview before production deployment.

## Manual items still required

- **Google Ads:** no Google Ads conversion ID/label or Google Tag Manager container ID was present, so none was invented. Add your real tag/container and configure the `callClickSendTo`, `whatsappClickSendTo`, and `quoteReadySendTo` values documented in `CONVERSION-SEO-SETUP.md`. A call/WhatsApp click is intent, not proof that a call connected or a WhatsApp message was sent.
- **Public reviews:** add the verified Google Business Profile review URL and customer-approved review text before showing actual reviews or review-rating structured data.
- **Real project photos:** the current gallery uses existing SVG illustrations. Replace/add authentic business photos when available; do not label stock/AI imagery as actual jobs performed.
- **Production deployment:** test all forms and routes in a Vercel preview, then deploy only after approval.
