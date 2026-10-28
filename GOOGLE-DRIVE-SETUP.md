# Google Drive storage setup (Vercel)

This package adds server-side Google OAuth, a 6-hour signed admin session, and Drive endpoints for saving PDFs and listing/downloading private records. It does not contain your Google Client Secret or refresh token. Configure credentials before using real customer data.

## 1. Deploy the code first

1. Extract this ZIP into the existing website repository folder (the folder with `index.html`, `vercel.json`, and `package.json`).
2. Replace the site files with the extracted versions. Keep your `.git` folder if already present.
3. Commit and push to the GitHub repository connected to Vercel.
4. Wait for the Vercel deployment to complete. Vercel automatically exposes JavaScript functions saved in the root `api/` directory.

## 2. Create Google OAuth credentials

1. Open https://console.cloud.google.com/ and select the project for the document desk.
2. Ensure **Google Drive API** is enabled: https://console.cloud.google.com/apis/library/drive.googleapis.com
3. Open Google Auth Platform / OAuth overview and configure the consent screen. For a personal Gmail integration, set the Audience to External and add `anujzirakpur@gmail.com` as a test user while testing.
4. Open **Google Auth Platform → Clients → Create Client**. Select **Web application**.
5. Use a recognizable name such as `Verified Movers Website`.
6. Under **Authorized redirect URIs**, add this exact URI (no trailing slash):

   `https://verifiedmoversandpackers.world/api/google/callback`

7. Create the client. Keep the Client ID and Client Secret private. Do not commit the secret to GitHub or put it in any HTML/JS file.

> The redirect URI in Google Cloud must be character-for-character identical to `GOOGLE_REDIRECT_URI` in Vercel.

## 3. Add initial environment variables in Vercel

In Vercel, open the project → **Settings → Environment Variables**. Add each variable for Production (and Preview only if you intend to test there):

- `GOOGLE_CLIENT_ID` — the OAuth Client ID from Google Cloud.
- `GOOGLE_CLIENT_SECRET` — the OAuth Client Secret from Google Cloud.
- `GOOGLE_REDIRECT_URI` — `https://verifiedmoversandpackers.world/api/google/callback`
- `GOOGLE_ALLOWED_EMAIL` — `anujzirakpur@gmail.com` (the only Google account allowed to access this register).
- `ADMIN_SESSION_SECRET` — a random secret of at least 32 characters.
- `GOOGLE_REFRESH_TOKEN` — leave unset until Step 4 returns it.

Generate a session secret using Windows PowerShell:

```powershell
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the output into `ADMIN_SESSION_SECRET`. Never use the sample/placeholder text as a real secret. Save and redeploy the project.

## 4. Authorize the Google account and save the refresh token

1. Open this URL in a browser after the deployment and variables above are active:

   `https://verifiedmoversandpackers.world/api/google/login?next=%2Fadmin.html`

2. Sign in with the account configured in `GOOGLE_ALLOWED_EMAIL`. Review and approve the Drive file access request.
3. On first authorization, the callback displays a refresh token once. Keep that page private. Copy the token and add it to Vercel as `GOOGLE_REFRESH_TOKEN`. This is a server secret; never paste it into chat, source code or GitHub.
4. Redeploy Vercel so the function can read the new environment variable. Then sign in again from the admin dashboard.

If the callback does not return a refresh token, remove this app from the Google Account third-party connections and repeat the authorization; this flow requests offline access and consent. Avoid sharing callback screenshots because they might contain the token.

## 5. Test storage

1. Open `https://verifiedmoversandpackers.world/admin.html` and click **Sign in with Google**.
2. Open an e-Bilty, quotation or bill and fill in the required fields. A manual **Save to Google Drive** button is available. After this update, **Create customer link** and **Print / Save PDF** attempt to save automatically before continuing; the WhatsApp share button starts the save in parallel so the WhatsApp popup is not blocked by the browser.
3. The first successful save creates a private Drive folder named `Verified Movers Documents` and uploads a PDF with document metadata. Reusing the same document type and document number updates the existing Drive file instead of creating a duplicate on every action.
4. Open `https://verifiedmoversandpackers.world/document-records.html`; search by document number/customer and use **Download PDF**.
5. In Google Drive, verify that `Verified Movers Documents` is private and that the PDF appears there. Do not set the folder to “Anyone with the link.”

## What the implementation currently supports

- Google OAuth login restricted to `GOOGLE_ALLOWED_EMAIL`; session cookie is HttpOnly, Secure, SameSite=Lax, HMAC-signed and expires after six hours.
- PDF uploads from the e-Bilty, quotation and bill previews (maximum 3 MB per generated PDF).
- Automatic Drive-save attempts when users create a customer link, share via WhatsApp, or start printing; customer-link and print flows wait for the save attempt, while WhatsApp saving runs in parallel to preserve the browser popup permission. If the account is not signed in or Drive is misconfigured, the original action still continues and the Drive status reports that no backup was saved.
- Repeated automatic saves for the same document type and document number update the existing Drive PDF rather than creating a new duplicate.
- Drive-based metadata register/search and authenticated PDF download. Document metadata is stored in Drive file `appProperties`; there is no separate SQL database or Google Sheet.
- The server creates the Drive folder automatically and keeps files private.

Not included yet: edit/update of stored documents, deletion/archive workflows, multiple staff roles, signed customer share links or automatic backup management. Customer-view links generated by the original static document templates are still URL-encoded rather than encrypted; don't use them for sensitive records.

## OAuth testing note

While the OAuth consent screen is in **Testing** mode for an External app, Google may issue refresh tokens that expire after seven days for these Drive scopes. Before relying on unattended access, review Google Auth Platform publishing/verification requirements for your app. Do not bypass Google's consent/verification rules.

## Troubleshooting

- `redirect_uri_mismatch`: verify the exact URI in Google Cloud and `GOOGLE_REDIRECT_URI`; no trailing slash.
- Missing environment variables: set all variables from Step 3 and redeploy.
- No refresh token: revoke the existing app authorization on the allowed Google account and authorize again with the consent screen.
- Drive access errors: confirm Drive API is enabled, OAuth scopes were granted, and the refresh token is from the permitted account.
- Large PDF rejected: current upload limit is 3 MB to stay under typical serverless request-body limits. Use the browser's Print / Save PDF for a local copy.
