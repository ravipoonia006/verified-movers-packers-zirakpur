# Online Moving Document Desk

The package includes:
- `online-documents.html` — document hub
- `online-bilty.html` — e-Bilty / consignment note
- `online-quotation.html` — editable moving quotation
- `online-bill.html` — bill book / invoice template

The pages render document previews in the browser and now include **Save to Google Drive**. When Google OAuth is configured, the action exports the preview as a PDF and uploads it to a private Drive folder through a server-side API. The document register uses Drive metadata for search and downloads.

## Required setup

Follow `GOOGLE-DRIVE-SETUP.md` before using real customer information. OAuth credentials and refresh tokens are not included in the ZIP. No records will be saved to Drive until the setup is complete and deployed.

## Important limitations

- The app does not use a separate SQL database or Google Sheet; document metadata is stored in private Google Drive file `appProperties`.
- PDF uploads are limited to 3 MB each in this version.
- Editing, deletion, archive management, multi-staff roles and revocable customer share links are not implemented yet.
- The existing customer-view links still encode data in a URL fragment; encoding is not encryption and those links do not expire or revoke. Do not put confidential information in these links.
- These templates do not verify tax treatment, submit tax returns, prove carrier acceptance, or replace required legal transport documents.
