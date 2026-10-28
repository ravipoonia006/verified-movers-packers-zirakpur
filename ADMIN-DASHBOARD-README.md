# Admin dashboard visual update

- `admin.html` now uses the same random theme palette selection as the public website, sharing the same session key so colors match while browsing.
- Admin sidebar now shows the real Verified Movers & Packers logo.
- Added subtle card/page entrance animations and reduced-motion accessibility behavior.
- Removed the Documents item from the public main navigation.
- Removed document desk, e-Bilty, quotation and bill links from public-site footers. Their pages remain in the package and are linked from `admin.html`; removing navigation links is not access control.
- This package still does not make the admin/document tools password-protected and does not add database persistence.
