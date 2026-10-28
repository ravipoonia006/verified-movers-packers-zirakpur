# Private document setup

The current package now includes a server-side Google OAuth flow and Google Drive-backed PDF storage API. It is not active until the OAuth client and Vercel environment variables are configured. Follow `GOOGLE-DRIVE-SETUP.md` from top to bottom.

The dashboard HTML alone is not an access-control boundary. The API verifies an HMAC-signed, six-hour HttpOnly session cookie, and only the account named in `GOOGLE_ALLOWED_EMAIL` is accepted. Keep all OAuth secrets in Vercel environment variables.
