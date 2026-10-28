# Admin dashboard visual update

- `admin.html` now uses the same random theme palette selection as the public website, sharing the same session key so colors match while browsing.
- Admin sidebar now shows the real Verified Movers & Packers logo.
- Added subtle card/page entrance animations and reduced-motion accessibility behavior.
- Removed the Documents item from the public main navigation.
- Removed document desk, e-Bilty, quotation and bill links from public-site footers. Their pages remain in the package and are linked from `admin.html`; removing navigation links is not access control.
- Added Google sign-in restricted to the configured account plus server-side Google Drive PDF save/search/download endpoints. These require setup in `GOOGLE-DRIVE-SETUP.md`; storage is not active until OAuth credentials and Vercel variables are configured.
- The admin dashboard itself remains an interface; protected records and Drive API endpoints enforce the signed session. Removing public navigation links alone is not access control.
