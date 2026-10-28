const crypto = require('crypto');

const SESSION_COOKIE = 'vmp_admin_session';
const STATE_COOKIE = 'vmp_oauth_state';
const NEXT_COOKIE = 'vmp_oauth_next';
const SESSION_SECONDS = 6 * 60 * 60;
const ALLOWED_NEXT = new Set([
  '/admin.html', '/document-records.html', '/online-documents.html',
  '/online-bilty.html', '/online-quotation.html', '/online-bill.html'
]);

function parseCookies(req) {
  const raw = req.headers && req.headers.cookie ? req.headers.cookie : '';
  return raw.split(';').reduce((out, pair) => {
    const idx = pair.indexOf('=');
    if (idx < 0) return out;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    try { out[key] = decodeURIComponent(val); } catch { out[key] = val; }
    return out;
  }, {});
}

function cookieLine(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path || '/'}`, 'HttpOnly', 'Secure', 'SameSite=Lax'];
  if (Number.isInteger(options.maxAge)) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join('; ');
}

function clearCookieLine(name, path = '/') {
  return `${name}=; Path=${path}; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function sendHtml(res, status, html) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  res.end(html);
}

function htmlEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function safeNext(value) {
  if (!value) return '/admin.html';
  try {
    const url = new URL(value, 'https://verifiedmoversandpackers.world');
    if (url.origin !== 'https://verifiedmoversandpackers.world') return '/admin.html';
    return ALLOWED_NEXT.has(url.pathname) ? url.pathname : '/admin.html';
  } catch { return '/admin.html'; }
}

function signSession(email) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters.');
  const payload = Buffer.from(JSON.stringify({ email: String(email).toLowerCase(), exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function timingSafeStringEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function getSession(req) {
  const cookies = parseCookies(req);
  const raw = cookies[SESSION_COOKIE];
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!raw || !secret || secret.length < 32) return null;
  const idx = raw.lastIndexOf('.');
  if (idx < 1) return null;
  const payload = raw.slice(0, idx);
  const signature = raw.slice(idx + 1);
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (!timingSafeStringEqual(signature, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.email || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) return null;
    const allowed = String(process.env.GOOGLE_ALLOWED_EMAIL || '').trim().toLowerCase();
    if (!allowed || data.email.toLowerCase() !== allowed) return null;
    return { email: data.email, exp: data.exp };
  } catch { return null; }
}

function requireSession(req, res) {
  const session = getSession(req);
  if (!session) {
    sendJson(res, 401, { ok: false, authenticated: false, message: 'Sign in with the authorized Google account to access document records.', loginUrl: '/api/google/login' });
    return null;
  }
  return session;
}

function getQuery(req) {
  try { return new URL(req.url, 'https://verifiedmoversandpackers.world').searchParams; }
  catch { return new URLSearchParams(); }
}

function setNoCache(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
}

module.exports = {
  SESSION_COOKIE, STATE_COOKIE, NEXT_COOKIE, SESSION_SECONDS,
  parseCookies, cookieLine, clearCookieLine, sendJson, sendHtml, htmlEscape,
  safeNext, signSession, getSession, requireSession, getQuery, setNoCache
};
