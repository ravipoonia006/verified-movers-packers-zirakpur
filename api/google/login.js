const crypto = require('crypto');
const { cookieLine, sendHtml, safeNext, STATE_COOKIE, NEXT_COOKIE } = require('../_lib/common.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return sendHtml(res, 405, '<h1>Method not allowed</h1>'); }
  const missing = ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REDIRECT_URI','GOOGLE_ALLOWED_EMAIL','ADMIN_SESSION_SECRET'].filter(k => !process.env[k]);
  if (missing.length || String(process.env.ADMIN_SESSION_SECRET || '').length < 32) {
    const msg = missing.length ? `Missing Vercel environment variables: ${missing.join(', ')}` : 'ADMIN_SESSION_SECRET must contain at least 32 characters.';
    return sendHtml(res, 503, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Google Drive setup required</title><h1>Google Drive setup is not configured</h1><p>${msg}</p><p>Set the variables in Vercel, redeploy, and try again.</p><p><a href="/admin.html">Return to admin</a></p>`);
  }
  const state = crypto.randomBytes(32).toString('base64url');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile https://www.googleapis.com/auth/drive.file');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('state', state);
  url.searchParams.set('login_hint', process.env.GOOGLE_ALLOWED_EMAIL);
  const next = safeNext(new URL(req.url, 'https://verifiedmoversandpackers.world').searchParams.get('next'));
  res.statusCode = 302;
  res.setHeader('Location', url.toString());
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', [
    cookieLine(STATE_COOKIE, state, { path: '/api/google', maxAge: 600 }),
    cookieLine(NEXT_COOKIE, next, { path: '/api/google', maxAge: 600 })
  ]);
  res.end();
};
