(function () {
  'use strict';
  var config;
  if (document.getElementById('biltyForm')) {
    config = { type: 'bilty', form: 'biltyForm', paper: 'biltyPaper', status: 'driveSaveStatus', button: 'saveToDriveButton', number: 'biltyNo', date: 'biltyDate', customer: 'consigneeName', phone: 'consigneePhone', from: 'fromCity', to: 'toCity', amount: '[data-bilty-total]' };
  } else if (document.getElementById('quotationForm')) {
    config = { type: 'quotation', form: 'quotationForm', paper: 'quotationPaper', status: 'driveSaveStatus', button: 'saveToDriveButton', number: 'qQuoteNo', date: 'qQuoteDate', customer: 'qCustomerName', phone: 'qCustomerPhone', from: 'qFrom', to: 'qTo', amount: '[data-q-total]' };
  } else if (document.getElementById('billForm')) {
    config = { type: 'bill', form: 'billForm', paper: 'billPaper', status: 'driveSaveStatus', button: 'saveToDriveButton', number: 'bBillNo', date: 'bBillDate', customer: 'bCustomerName', phone: 'bCustomerPhone', from: 'bFrom', to: 'bTo', amount: '[data-b-subtotal]' };
  } else return;

  function el(id) { return document.getElementById(id); }
  function value(id) { var n = el(id); return n ? String(n.value || '').trim() : ''; }
  function setStatus(message, error) {
    var node = el(config.status);
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('is-error', Boolean(error));
  }
  function safeFilePart(text) { return String(text || 'document').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'document'; }
  function readAmount() {
    var node = document.querySelector(config.amount);
    return node ? node.textContent.trim().replace(/\s+/g, ' ') : '';
  }
  function meta() {
    return {
      documentType: config.type,
      documentNumber: value(config.number),
      documentDate: value(config.date),
      customerName: value(config.customer),
      customerPhone: value(config.phone),
      fromCity: value(config.from),
      toCity: value(config.to),
      amount: readAmount()
    };
  }
  async function getPdfBase64(paper) {
    if (typeof window.html2pdf !== 'function') throw new Error('The PDF tool did not load. Refresh the page and try again.');
    var wrapper = document.createElement('div');
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.style.cssText = 'position:fixed;left:-20000px;top:0;width:820px;z-index:-1;background:#ffffff;overflow:visible;pointer-events:none;';
    var clone = paper.cloneNode(true);
    clone.style.boxShadow = 'none';
    clone.style.margin = '0 auto';
    clone.style.maxWidth = 'none';
    clone.style.breakInside = 'auto';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    try {
      var dataUri = await window.html2pdf().set({
        margin: [7, 7, 7, 7],
        filename: safeFilePart(value(config.number)) + '.pdf',
        image: { type: 'jpeg', quality: 0.9 },
        html2canvas: { scale: 1.25, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: ['css', 'legacy'] }
      }).from(clone).outputPdf('datauristring');
      var comma = dataUri.indexOf(',');
      if (comma < 0) throw new Error('The PDF could not be generated.');
      return dataUri.slice(comma + 1);
    } finally { wrapper.remove(); }
  }

  var activeSavePromise = null;

  async function saveImpl(options) {
    options = options || {};
    var automatic = options.automatic === true;
    var button = el(config.button);
    var form = el(config.form);
    var paper = el(config.paper);
    if (!button || !form || !paper) return;
    if (document.body.classList.contains('bilty-shared-view') || document.body.classList.contains('doc-shared-view')) {
      setStatus('Read-only customer views cannot be saved to the business register.', true); return;
    }
    if (automatic) {
      if (!form.checkValidity()) return false;
    } else if (!form.reportValidity()) return false;
    var data = meta();
    if (!data.documentNumber || !data.customerName) {
      setStatus('Enter the document number and customer name before saving.', true); return;
    }
    button.disabled = true;
    var oldText = button.textContent;
    button.textContent = 'Preparing PDF…';
    setStatus('Checking Google sign-in…');
    try {
      var sessionResponse = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' });
      var session = await sessionResponse.json();
      if (!session.authenticated) {
        if (automatic) {
          setStatus('Not saved automatically: sign in with your authorized Google account first, then repeat this action. The requested action will continue.', true);
          return false;
        }
        setStatus('Please sign in with your authorized Google account. Redirecting…');
        location.href = '/api/google/login?next=' + encodeURIComponent(location.pathname);
        return false;
      }
      if (!session.driveConfigured) {
        setStatus('Automatic save could not run because Google Drive is not fully configured. Check GOOGLE_REFRESH_TOKEN in Vercel and redeploy, then retry.', true);
        return false;
      }
      var pdfBase64 = await getPdfBase64(paper);
      if (pdfBase64.length > 4190000) throw new Error('This PDF is too large for the current upload limit. Use Print / Save PDF to save a compressed copy; the upload limit is 3 MB.');
      button.textContent = 'Uploading to Drive…';
      setStatus('Uploading the PDF to your private Google Drive folder…');
      var response = await fetch('/api/drive/upload', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, data, { pdfBase64: pdfBase64 }))
      });
      var result = await response.json().catch(function () { return {}; });
      if (response.status === 401) {
        if (automatic) { setStatus('Automatic save failed because your Google session expired. Sign in again, then repeat this action.', true); return false; }
        location.href = '/api/google/login?next=' + encodeURIComponent(location.pathname); return false;
      }
      if (!response.ok || !result.ok) throw new Error(result.message || 'Could not save the document to Google Drive.');
      var size = result.record && result.record.size ? (result.record.size / 1024).toFixed(0) + ' KB' : 'PDF';
      setStatus((result.updated ? 'Updated in Google Drive: ' : 'Saved to Google Drive: ') + (result.record.name || data.documentNumber + '.pdf') + ' (' + size + '). Open Document Register to find it later.');
      button.textContent = 'Saved ✓';
      button.classList.add('drive-saved');
      window.setTimeout(function () { button.textContent = oldText; button.classList.remove('drive-saved'); }, 2500);
      return true;
    } catch (error) {
      setStatus((automatic ? 'Automatic save failed: ' : '') + (error && error.message ? error.message : 'Could not save the document.'), true);
      return false;
    } finally {
      button.disabled = false;
      if (!button.classList.contains('drive-saved')) button.textContent = oldText;
    }
  }

  function save(options) {
    if (activeSavePromise) return activeSavePromise;
    activeSavePromise = saveImpl(options).catch(function (error) {
      setStatus(error && error.message ? error.message : 'Could not save the document to Google Drive.', true);
      return false;
    }).finally(function () { activeSavePromise = null; });
    return activeSavePromise;
  }

  var linkButtons = new Set(['biltyMakeShare', 'qMakeShare', 'bMakeShare']);
  var whatsappButtons = new Set(['biltyShareWhatsApp', 'qShareWhatsApp', 'bShareWhatsApp']);
  var printButtons = new Set(['biltyPrint', 'biltyPreviewPrint', 'qPrint', 'qPreviewPrint', 'bPrint', 'bPreviewPrint']);
  var replayingAction = false;
  function isReadOnlyView() {
    return document.body.classList.contains('bilty-shared-view') || document.body.classList.contains('doc-shared-view');
  }
  function replayClick(button) {
    replayingAction = true;
    try { button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); }
    finally { replayingAction = false; }
  }
  document.addEventListener('click', function (event) {
    if (replayingAction || isReadOnlyView()) return;
    var target = event.target && event.target.closest ? event.target.closest('button') : null;
    if (!target || !target.id) return;
    var isLink = linkButtons.has(target.id);
    var isWhatsApp = whatsappButtons.has(target.id);
    var isPrint = printButtons.has(target.id);
    if (!isLink && !isWhatsApp && !isPrint) return;
    var form = el(config.form);
    if (!form || !form.checkValidity()) return; // Let the original handler display validation.

    if (isWhatsApp) {
      // Keep this click synchronous so the WhatsApp window is not blocked by browsers.
      // The save runs in parallel and reports any issue in the Drive status area.
      save({ automatic: true });
      return;
    }

    // Create-link and print do not require a new tab, so wait for the Drive save
    // attempt before continuing. If Drive is not configured, the original action
    // still proceeds and the status message explains that the backup was not saved.
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    setStatus(isLink ? 'Saving a private copy to Google Drive before creating the customer link…' : 'Saving a private copy to Google Drive before opening print…');
    save({ automatic: true }).finally(function () { replayClick(target); });
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    var button = el(config.button);
    if (button) button.addEventListener('click', function () { save({ automatic: false }); });
  });
})();
