(function () {
  'use strict';
  function byId(id) { return document.getElementById(id); }
  function setText(id, value) { var el = byId(id); if (el) el.textContent = value; }
  function setStatus(kind, title, detail, pill) {
    var symbol = byId('driveStatusSymbol');
    var tag = byId('driveStatusPill');
    if (symbol) { symbol.className = 'status-symbol ' + (kind === 'good' ? 'available' : 'attention'); symbol.textContent = kind === 'good' ? '✓' : '!'; }
    if (tag) { tag.className = 'status-pill ' + (kind === 'good' ? 'available-pill' : 'attention-pill'); tag.textContent = pill; }
    setText('driveStatusText', detail);
  }
  async function run() {
    try {
      var r = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' });
      var s = await r.json();
      var signInLink = byId('googleSignInLink');
      var signOutButton = byId('adminSignOutButton');
      if (signOutButton) signOutButton.hidden = Boolean(!s.authenticated);
      if (signInLink) signInLink.hidden = Boolean(s.authenticated);
      if (!s.authenticated) {
        setStatus('warn', '', 'Sign in with the authorized Google account to activate document storage.', 'Sign-in needed');
        setText('accessStatusText', 'Google account sign-in is required');
        setText('accessStatusPill', 'Sign-in needed');
        var accessPill = byId('accessStatusPill'); if (accessPill) accessPill.className = 'status-pill attention-pill';
        return;
      }
      setText('accessStatusText', 'Signed in as ' + s.email);
      setText('accessStatusPill', 'Signed in');
      var accessPill = byId('accessStatusPill'); if (accessPill) accessPill.className = 'status-pill available-pill';
      if (!s.driveConfigured) {
        setStatus('warn', '', 'Account verified; finish setup by adding GOOGLE_REFRESH_TOKEN in Vercel and redeploying.', 'Setup needed');
        return;
      }
      var statusResponse = await fetch('/api/drive/status', { credentials: 'same-origin', cache: 'no-store' });
      var drive = await statusResponse.json();
      if (drive.connected) setStatus('good', '', drive.recordCount + ' saved file(s) in ' + drive.folderName + '.', 'Connected');
      else setStatus('warn', '', drive.message || 'Google Drive is not connected yet.', 'Not connected');
    } catch (e) {
      setStatus('warn', '', 'Unable to check Google Drive right now. Check the deployment and environment variables.', 'Unavailable');
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    var signOut = byId('adminSignOutButton');
    if (signOut) signOut.addEventListener('click', async function () { await fetch('/api/auth/logout', { method:'POST', credentials:'same-origin' }); location.reload(); });
    run();
  });
})();
