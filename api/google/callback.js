const {
  parseCookies, cookieLine, clearCookieLine, sendHtml, htmlEscape,
  safeNext, signSession, STATE_COOKIE, NEXT_COOKIE, SESSION_COOKIE
} = require('../_lib/common.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return sendHtml(res, 405, '<h1>Method not allowed</h1>'); }
  const q = new URL(req.url, 'https://verifiedmoversandpackers.world').searchParams;
  const cookies = parseCookies(req);
  const state = q.get('state') || '';
  const stateCookie = cookies[STATE_COOKIE] || '';
  const clearState = [clearCookieLine(STATE_COOKIE, '/api/google'), clearCookieLine(NEXT_COOKIE, '/api/google')];
  if (!state || !stateCookie || state !== stateCookie) {
    res.setHeader('Set-Cookie', clearState);
    return sendHtml(res, 400, '<!doctype html><meta charset="utf-8"><title>Sign-in check failed</title><h1>Google sign-in could not be verified</h1><p>For your protection, the sign-in state did not match. Start again from the admin dashboard.</p><p><a href="/admin.html">Return to admin</a></p>');
  }
  if (q.get('error')) {
    res.setHeader('Set-Cookie', clearState);
    return sendHtml(res, 400, '<!doctype html><meta charset="utf-8"><title>Google sign-in cancelled</title><h1>Google sign-in was cancelled</h1><p>No document data was changed.</p><p><a href="/admin.html">Return to admin</a></p>');
  }
  try {
    const body = new URLSearchParams({
      code: q.get('code') || '',
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
      grant_type: 'authorization_code'
    });
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.id_token) throw new Error('Google did not return a valid identity token. Check the client credentials and redirect URI.');

    const verifyResponse = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(tokens.id_token));
    const identity = await verifyResponse.json();
    const allowedEmail = String(process.env.GOOGLE_ALLOWED_EMAIL || '').trim().toLowerCase();
    if (!verifyResponse.ok || identity.aud !== process.env.GOOGLE_CLIENT_ID || String(identity.email || '').toLowerCase() !== allowedEmail || String(identity.email_verified).toLowerCase() !== 'true') {
      res.setHeader('Set-Cookie', clearState);
      return sendHtml(res, 403, '<!doctype html><meta charset="utf-8"><title>Account not authorized</title><h1>This Google account is not authorized</h1><p>Sign in with the Google account configured in GOOGLE_ALLOWED_EMAIL. No document records were opened.</p><p><a href="/admin.html">Return to admin</a></p>');
    }

    const sessionCookie = cookieLine(SESSION_COOKIE, signSession(identity.email), { path: '/', maxAge: 21600 });
    res.setHeader('Set-Cookie', [...clearState, sessionCookie]);

    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      if (!tokens.refresh_token) {
        return sendHtml(res, 200, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Drive authorization needs one more step</title><h1>Google account verified, but no refresh token was returned</h1><p>Keep this page private. In your Google Account, remove this app from third-party connections, then restart Google sign-in so consent can issue a new refresh token. Ensure the login route requests offline access.</p><p><a href="/api/google/login?next=%2Fadmin.html">Try Google authorization again</a></p>');
      }
      const refreshToken = String(tokens.refresh_token);
      const safeToken = htmlEscape(refreshToken);
      return sendHtml(res, 200, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Finish Google Drive setup</title></head><body style="font:16px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#172033"><h1>Google authorization succeeded</h1><p>Your Google account was verified. Before the website can save documents, copy the refresh token below into Vercel as the <code>GOOGLE_REFRESH_TOKEN</code> environment variable, then redeploy.</p><p><strong>Keep this token private.</strong> Do not send it in chat, email, or GitHub. Anyone with it may be able to access the Drive files permitted to this app.</p><label for="refreshToken"><strong>Google refresh token</strong></label><textarea id="refreshToken" readonly spellcheck="false" style="display:block;width:100%;min-height:115px;box-sizing:border-box;margin:8px 0 12px;padding:12px;border:1px solid #aab4c5;border-radius:8px">${safeToken}</textarea><button id="copyToken" style="padding:10px 16px;border:0;border-radius:8px;background:#155eef;color:white;font-weight:700;cursor:pointer">Copy refresh token</button><span id="copyStatus" role="status" style="margin-left:10px"></span><h2>Finish setup</h2><ol><li>Open Vercel → your project → Settings → Environment Variables.</li><li>Add <code>GOOGLE_REFRESH_TOKEN</code> with the token above for Production (and Preview if needed).</li><li>Redeploy the project.</li><li>Return to the website and sign in again.</li></ol><p><a href="/admin.html">Return to admin dashboard</a></p><script>document.getElementById('copyToken').addEventListener('click',async function(){const t=document.getElementById('refreshToken');try{await navigator.clipboard.writeText(t.value);document.getElementById('copyStatus').textContent='Copied. Paste it into Vercel now.'}catch(e){t.select();document.execCommand('copy');document.getElementById('copyStatus').textContent='Copy selected text and paste it into Vercel.'}});</script></body></html>`);
    }

    const next = safeNext(cookies[NEXT_COOKIE]);
    res.statusCode = 302;
    res.setHeader('Location', next);
    res.setHeader('Cache-Control', 'no-store');
    res.end();
  } catch (err) {
    res.setHeader('Set-Cookie', clearState);
    const message = htmlEscape(err && err.message ? err.message : 'Unexpected authorization error.');
    return sendHtml(res, 500, `<!doctype html><meta charset="utf-8"><title>Google authorization error</title><h1>Could not complete Google authorization</h1><p>${message}</p><p>Check the Vercel environment variables and that the Google OAuth redirect URI exactly matches the deployed callback URL.</p><p><a href="/admin.html">Return to admin</a></p>`);
  }
};
