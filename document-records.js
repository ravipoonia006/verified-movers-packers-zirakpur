(function () {
  'use strict';
  var records = [];
  var latestSearch = '';
  var currentType = '';
  var currentStatus = '';
  var searchTimer = null;
  var statusNode = document.getElementById('recordsStatus');
  var bodyNode = document.getElementById('recordsBody');

  function byId(id) { return document.getElementById(id); }
  function showStatus(message, error) {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.classList.toggle('is-error', Boolean(error));
  }
  function textCell(row, value) {
    var cell = document.createElement('td');
    cell.textContent = value == null || value === '' ? '—' : String(value);
    row.appendChild(cell);
    return cell;
  }
  function fmtDate(value) {
    if (!value) return '—';
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-IN', { day:'2-digit', month:'short', year:'numeric' }).format(d);
  }
  function sizeLabel(bytes) {
    var n = Number(bytes) || 0;
    return n >= 1048576 ? (n / 1048576).toFixed(2) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
  }
  function downloadRecord(record, button) {
    var old = button.textContent;
    button.disabled = true; button.textContent = 'Downloading…';
    fetch('/api/drive/download?id=' + encodeURIComponent(record.id), { credentials:'same-origin', cache:'no-store' })
      .then(async function (response) {
        if (response.status === 401) { location.href = '/api/google/login?next=%2Fdocument-records.html'; return null; }
        var type = response.headers.get('content-type') || '';
        if (!response.ok) {
          var error = type.indexOf('application/json') !== -1 ? await response.json() : {};
          throw new Error(error.message || 'Could not download this document.');
        }
        return response.blob();
      }).then(function (blob) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = record.name || 'document.pdf';
        document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        showStatus('Downloaded ' + (record.name || 'document') + ' (' + sizeLabel(record.size) + ').');
      }).catch(function (error) { showStatus(error.message || 'Download failed.', true); })
      .finally(function () { button.disabled = false; button.textContent = old; });
  }
  function render() {
    if (!bodyNode) return;
    bodyNode.replaceChildren();
    var filtered = records.filter(function (r) {
      var q = latestSearch.toLowerCase();
      var matchesSearch = !q || [r.name,r.docNumber,r.customerName,r.customerPhone,r.fromCity,r.toCity,r.docType].join(' ').toLowerCase().includes(q);
      var matchesType = !currentType || r.docType === currentType;
      var matchesStatus = !currentStatus || r.status === currentStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
    var countAll = byId('countAll'), countDraft = byId('countDraft'), countIssued = byId('countIssued');
    if (countAll) countAll.textContent = String(records.length);
    if (countDraft) countDraft.textContent = String(records.filter(function (r) { return r.status === 'draft'; }).length);
    if (countIssued) countIssued.textContent = String(records.filter(function (r) { return r.status === 'issued'; }).length);
    if (!filtered.length) {
      var empty = document.createElement('tr'); var cell = document.createElement('td'); cell.colSpan = 7; cell.className = 'private-empty';
      cell.textContent = records.length ? 'No saved documents match these filters.' : 'No files found in your private Google Drive document folder yet.';
      empty.appendChild(cell); bodyNode.appendChild(empty); return;
    }
    filtered.forEach(function (r) {
      var tr = document.createElement('tr');
      var docCell = document.createElement('td');
      var strong = document.createElement('strong'); strong.textContent = r.docNumber || r.name; docCell.appendChild(strong);
      var sub = document.createElement('small'); sub.style.display = 'block'; sub.style.color = '#728096'; sub.textContent = String(r.docType || 'document').toUpperCase() + ' · ' + sizeLabel(r.size); docCell.appendChild(sub);
      tr.appendChild(docCell);
      textCell(tr, r.customerName + (r.customerPhone ? '\n' + r.customerPhone : ''));
      textCell(tr, [r.fromCity, r.toCity].filter(Boolean).join(' → '));
      textCell(tr, r.amount || '—');
      textCell(tr, r.status || 'issued');
      textCell(tr, fmtDate(r.modifiedTime || r.createdTime || r.documentDate));
      var actionCell = document.createElement('td');
      var download = document.createElement('button'); download.type = 'button'; download.className = 'private-btn private-btn--primary'; download.textContent = 'Download PDF';
      download.addEventListener('click', function () { downloadRecord(r, download); }); actionCell.appendChild(download); tr.appendChild(actionCell);
      bodyNode.appendChild(tr);
    });
  }
  async function loadRecords() {
    showStatus('Checking Google sign-in and loading records…');
    try {
      var sessionResponse = await fetch('/api/auth/session', { credentials:'same-origin', cache:'no-store' });
      var session = await sessionResponse.json();
      if (!session.authenticated) { location.href = '/api/google/login?next=%2Fdocument-records.html'; return; }
      var login = byId('googleLoginButton'); if (login) login.hidden = true;
      var signout = byId('logoutButton'); if (signout) signout.hidden = false;
      if (!session.driveConfigured) {
        showStatus('Google account verified, but Drive is not configured. Follow GOOGLE-DRIVE-SETUP.md, add GOOGLE_REFRESH_TOKEN to Vercel and redeploy.', true);
        if (bodyNode) bodyNode.innerHTML = '<tr><td colspan="7" class="private-empty">Finish Google Drive setup before loading records.</td></tr>';
        return;
      }
      var params = new URLSearchParams(); if (latestSearch) params.set('q', latestSearch); if (currentType) params.set('type', currentType);
      var response = await fetch('/api/drive/records?' + params.toString(), { credentials:'same-origin', cache:'no-store' });
      var data = await response.json();
      if (response.status === 401) { location.href = '/api/google/login?next=%2Fdocument-records.html'; return; }
      if (!response.ok || !data.ok) throw new Error(data.message || 'Could not load saved Drive files.');
      records = Array.isArray(data.records) ? data.records : [];
      showStatus(records.length + ' saved file(s) loaded from the private Google Drive folder “' + data.folderName + '”. The files remain in Drive; this register displays metadata and downloads files on request.');
      render();
    } catch (error) {
      showStatus(error.message || 'Could not load the Google Drive register.', true);
      if (bodyNode) bodyNode.innerHTML = '<tr><td colspan="7" class="private-empty">Could not load records. Check your Vercel deployment, OAuth credentials and Drive API setup.</td></tr>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var search = byId('recordSearch'), type = byId('recordType'), status = byId('recordStatus');
    if (search) search.addEventListener('input', function () { latestSearch = search.value.trim(); window.clearTimeout(searchTimer); searchTimer = window.setTimeout(loadRecords, 280); });
    if (type) type.addEventListener('change', function () { currentType = type.value; loadRecords(); });
    if (status) status.addEventListener('change', function () { currentStatus = status.value; render(); });
    var refresh = byId('refreshRecords'); if (refresh) refresh.addEventListener('click', loadRecords);
    var archived = byId('showArchived'); if (archived) { archived.disabled = true; archived.title = 'Archive handling is not implemented in this Drive-backed version.'; archived.addEventListener('click', function () { showStatus('Archive management is not included yet. Saved documents are retained in Drive until you remove them there.', true); }); }
    var signout = byId('logoutButton'); if (signout) signout.addEventListener('click', async function () { await fetch('/api/auth/logout', { method:'POST', credentials:'same-origin' }); location.href = '/admin.html'; });
    loadRecords();
  });
})();
