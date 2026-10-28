# Document stamps and Google Drive register

The e-Bilty, quotation and bill templates include a decorative digital company seal. It is not a handwritten signature, government certification or proof of carrier acceptance.

This version adds Google OAuth and Google Drive endpoints. Once `GOOGLE-DRIVE-SETUP.md` is completed, the Save to Google Drive buttons create PDF copies in the private `Verified Movers Documents` folder. Drive file metadata stores the document number, type, customer, phone, route, date and amount. The register retrieves and searches that metadata and downloads PDFs through an authenticated endpoint.

Before configuration, saved records are still zero: code is included, but Google OAuth and Vercel environment variables must be configured before the remote Drive connection works. This implementation uses Drive metadata instead of a separate database or Google Sheet.
