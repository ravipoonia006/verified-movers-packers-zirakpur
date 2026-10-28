# Secure Document Desk — Required Deployment Setup

This ZIP includes the public marketing website and the private document-desk UI. The private area is deliberately **fail-closed**: login, server-side record storage, and customer share links will not work until a real backend is configured. This avoids pretending that browser-only code securely protects business records.

## Before using real documents
1. Add server-side API routes for login/logout/session validation, document CRUD, share-link creation/revocation, and public token validation.
2. Store password hashes and session secrets only in Vercel Environment Variables; never put secrets in HTML/JavaScript or commit them to GitHub.
3. Use a database with access policies and backups (for example, Supabase/Postgres); restrict document APIs to authenticated staff sessions.
4. Generate random share tokens, store only token hashes, set expiry, and support revocation. Do not encode full document contents in URL parameters/fragments.
5. Configure HTTPS, secure HttpOnly SameSite cookies, CSRF protections where needed, rate limits, audit history, and database backups.
6. Verify access control on every API route and test unauthenticated direct URLs before entering customer data.

## Current record-storage capacity
- Current server-side storage capacity in this package: **0 records / 0 MB** because no database or records API is configured.
- The register page intentionally displays that the backend is unavailable; it does not save records in localStorage.
- The three public document forms generate previews in the browser. Their share links carry Base64url-encoded form data in the URL fragment; this is encoding, not encryption, and those links are not centrally stored, expiring, or revocable by this static site.
- Print/PDF exports are saved manually on the user's device.

## Current state
- Public pages and browser-side document form pages are included.
- Private login/register/share UI pages are included but fail closed.
- **No server-side database is connected and no private records have been saved by this ZIP.**
- Do not rely on hidden links, `noindex`, or a client-side password as security.

The public document generators may still have their own browser-only share behavior. Do not use those old encoded links for confidential data; use PDF delivery until secure backend sharing is implemented.
