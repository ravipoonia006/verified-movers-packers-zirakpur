# Final package notes

This package contains the site pages/assets, admin dashboard, document stamps, Vercel serverless API routes for Google OAuth and Drive file storage, and the setup guide `GOOGLE-DRIVE-SETUP.md`.

The Drive integration is implemented in code but is not live until you deploy this ZIP and configure the Google OAuth client plus Vercel environment variables. On first authorization, copy the refresh token shown by the callback page into Vercel as `GOOGLE_REFRESH_TOKEN` and redeploy. Do not put secrets into GitHub or chat.

Current supported storage actions: save a PDF from e-Bilty/quotation/bill, list/search saved Drive file metadata, and download PDFs through an authenticated API. The app uses a private Google Drive folder and does not use a separate SQL database or Google Sheets. See `GOOGLE-DRIVE-SETUP.md` for exact steps and limitations.
