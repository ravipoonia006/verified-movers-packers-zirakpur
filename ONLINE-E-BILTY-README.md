# Online e-Bilty / Consignment Note

Added `online-bilty.html` to the Verified Movers & Packers static website. The page uses the site's 50-theme session palette and existing navigation, footer, shared stylesheet, and shared script.

## Features
- Editable consignor, consignee, route, vehicle, goods, packing, insurance/declared value, charges, tax and remarks fields.
- Live printable customer-document preview with automatic bilty number and current India date.
- Charge total calculated from freight, surcharge, loading, unloading, risk/other, and GST fields.
- Print / Save as PDF (browser print dialog).
- Generates a customer-view URL using a base64url-encoded JSON value in the URL fragment; shared view is read-only and print-friendly.
- Optional WhatsApp share opens a message with the customer-view link; if a consignee mobile is supplied, it attempts to address that mobile (Indian 10-digit / country-code format).
- Responsive editor and document view; reduced-motion support.

## Important limitations
This is a static client-side utility. It does not save bills on a server, authenticate users, or provide revocable links. URL-fragment data is encoded, **not encrypted**; anyone who receives the link can view its contents. For confidential customer documents, use the PDF in a trusted channel or add a backend with authentication, expiring access links, storage, and audit logging. This template does not replace any legally required e-way bill or prescribed transport document. Confirm applicable requirements and terms before operational use.
