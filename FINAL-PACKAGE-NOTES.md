# Final package notes

This package contains the site pages/assets, admin dashboard, document stamps, Vercel serverless API routes for Google OAuth and Drive file storage, and the setup guide `GOOGLE-DRIVE-SETUP.md`.

The Drive integration is implemented in code but is not live until you deploy this ZIP and configure the Google OAuth client plus Vercel environment variables. On first authorization, copy the refresh token shown by the callback page into Vercel as `GOOGLE_REFRESH_TOKEN` and redeploy. Do not put secrets into GitHub or chat.

Current supported storage actions: save a PDF from e-Bilty/quotation/bill, list/search saved Drive file metadata, and download PDFs through an authenticated API. The app uses a private Google Drive folder and does not use a separate SQL database or Google Sheets. See `GOOGLE-DRIVE-SETUP.md` for exact steps and limitations.


## Automatic Google Drive saves

On the e-Bilty, quotation and bill pages, creating a customer link or starting print attempts a Drive save first, and WhatsApp sharing starts an automatic save in parallel. If Drive is not configured or the user is not signed in, the action still proceeds and a status message explains that the copy was not saved. Repeated saves for the same document type and number update the existing Drive file.
