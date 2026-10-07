// Verified Movers & Packers — shared front-end behaviour
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '918607227219';
  var PHONE_DISPLAY = '+91 86072 27219';
  var BUSINESS_NAME = 'Verified Movers & Packers';
  var BUSINESS_EMAIL = 'anujzirakpur@gmail.com';

  function waLink(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }
  window.VerifiedMoversWA = { number: WHATSAPP_NUMBER, display: PHONE_DISPLAY, link: waLink };

  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function prettyDate(value) {
    if (!value) return 'Not specified';
    var d = new Date(value + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ---------- Quote request form ---------- */
  var form = document.getElementById('quoteForm');
  if (form) {
    var submitBtn = form.querySelector('.slip-submit');
    var successBox = document.getElementById('slipSuccess');
    var stampTag = document.getElementById('slipStamp');
    var slipNoEl = document.getElementById('slipNo');
    var formKind = form.dataset.kind || 'quote';

    function fieldError(input, msg) {
      if (!input) return;
      var wrap = input.closest('.field');
      var err = wrap ? wrap.querySelector('.field-error') : null;
      if (err) err.textContent = msg || '';
      input.classList.toggle('has-error', !!msg);
    }

    function validatePhone(v) {
      var digits = v.replace(/\D/g, '');
      return digits.length >= 10;
    }

    function validateDate(input) {
      if (!input || !input.value) return false;
      if (input.dataset.allowPast === 'true') return true;
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(input.value + 'T00:00:00') >= today;
    }

    function randomSlipNo(prefix) {
      return prefix + '-' + Math.floor(10000 + Math.random() * 89999);
    }

    function setResult(id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text || 'Not specified';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var name = form.querySelector('[name="name"]');
      var from = form.querySelector('[name="from"]');
      var to = form.querySelector('[name="to"]');
      var size = form.querySelector('[name="size"]');
      var date = form.querySelector('[name="date"]');
      var phone = form.querySelector('[name="phone"]');
      var email = form.querySelector('[name="email"]');
      var service = form.querySelector('[name="service"]');

      if (name && !name.value.trim()) { fieldError(name, 'Required'); valid = false; } else fieldError(name);
      if (!from.value.trim()) { fieldError(from, 'Required'); valid = false; } else fieldError(from);
      if (!to.value.trim()) { fieldError(to, 'Required'); valid = false; } else fieldError(to);
      if (!size.value) { fieldError(size, 'Select one'); valid = false; } else fieldError(size);
      if (!service.value) { fieldError(service, 'Select one'); valid = false; } else fieldError(service);
      if (!validateDate(date)) { fieldError(date, 'Pick a valid date'); valid = false; } else fieldError(date);
      if (!validatePhone(phone.value)) { fieldError(phone, 'Enter 10-digit number'); valid = false; } else fieldError(phone);
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { fieldError(email, 'Enter a valid email'); valid = false; } else fieldError(email);

      if (!valid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'PREPARING WHATSAPP…';

      var slipNo = randomSlipNo(formKind === 'vendor' ? 'VMP-V' : 'VMP');
      var moveDate = prettyDate(val(form, 'date'));
      var customerName = val(form, 'name');
      var customerPhone = val(form, 'phone');
      var customerEmail = val(form, 'email') || 'Not provided';
      var serviceType = val(form, 'service');
      var extra = val(form, 'notes') || 'None';

      var message =
        '📦 NEW QUOTE REQUEST\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        'Reference: ' + slipNo + '\n' +
        'Customer: ' + customerName + '\n' +
        'WhatsApp/Mobile: ' + customerPhone + '\n' +
        'Email: ' + customerEmail + '\n' +
        'Pickup: ' + val(form, 'from') + '\n' +
        'Drop: ' + val(form, 'to') + '\n' +
        'Move date: ' + moveDate + '\n' +
        'Move size: ' + val(form, 'size') + '\n' +
        'Service: ' + serviceType + '\n' +
        'Extra instructions: ' + extra + '\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        BUSINESS_NAME;

      setTimeout(function () {
        if (slipNoEl) slipNoEl.textContent = slipNo;
        if (stampTag) { stampTag.textContent = 'READY'; stampTag.classList.add('done'); }

        setResult('resultCustomer', customerName);
        setResult('resultRoute', val(form, 'from') + ' → ' + val(form, 'to'));
        setResult('resultDate', moveDate);
        setResult('resultPhone', customerPhone);
        setResult('resultService', serviceType);
        setResult('resultSize', val(form, 'size'));
        setResult('refEcho', slipNo);

        form.style.display = 'none';
        if (successBox) successBox.classList.add('show');
        window._latestQuoteMessage = message;
        window.open(waLink(message), '_blank');

        var compareSection = document.getElementById('compare');
        if (compareSection && formKind !== 'vendor') {
          setTimeout(function () {
            compareSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (typeof runDemoQuotes === 'function') runDemoQuotes();
          }, 500);
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'GENERATE MY SLIP →';
      }, 350);
    });
  }

  /* ---------- Result actions ---------- */
  var resend = document.getElementById('resendWhatsApp');
  if (resend) resend.addEventListener('click', function () {
    if (window._latestQuoteMessage) window.open(waLink(window._latestQuoteMessage), '_blank');
  });

  var copyBtn = document.getElementById('copySlip');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    if (!window._latestQuoteMessage) return;
    navigator.clipboard.writeText(window._latestQuoteMessage).then(function () {
      copyBtn.textContent = 'COPIED ✓';
      setTimeout(function(){ copyBtn.textContent = 'COPY DETAILS'; }, 1400);
    });
  });

  var printBtn = document.getElementById('printSlip');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  /* ---------- Compare-quotes demo ---------- */
  window.runDemoQuotes = function () {
    var body = document.getElementById('compareBody');
    if (!body) return;
    body.innerHTML = '<tr class="placeholder-row"><td colspan="8">Matching verified movers on this route…</td></tr>';

    var vendors = [
      { name: 'Tricity Safe Movers', base: 4200, pack: 1100, labor: 1800, ins: 400, rating: '4.8' },
      { name: 'Punjab Cargo Movers', base: 3900, pack: 950, labor: 1600, ins: 350, rating: '4.6' },
      { name: 'Swift & Safe Relocations', base: 4600, pack: 1200, labor: 2000, ins: 450, rating: '4.9' }
    ];

    setTimeout(function () {
      body.innerHTML = '';
      var bestTotal = Infinity;
      vendors.forEach(function (v) { bestTotal = Math.min(bestTotal, v.base + v.pack + v.labor + v.ins); });
      vendors.forEach(function (v, i) {
        var total = v.base + v.pack + v.labor + v.ins;
        var row = document.createElement('tr');
        row.className = 'reveal' + (total === bestTotal ? ' best-row' : '');
        row.style.animationDelay = (i * 0.12) + 's';
        row.innerHTML =
          '<td class="vendor-name">' + v.name + '<span class="badge-verified">VERIFIED</span></td>' +
          '<td>₹' + v.base.toLocaleString('en-IN') + '</td>' +
          '<td>₹' + v.pack.toLocaleString('en-IN') + '</td>' +
          '<td>₹' + v.labor.toLocaleString('en-IN') + '</td>' +
          '<td>₹' + v.ins.toLocaleString('en-IN') + '</td>' +
          '<td class="total-cell">₹' + total.toLocaleString('en-IN') + '</td>' +
          '<td class="mono">★ ' + v.rating + '</td>' +
          '<td><button class="choose-btn" type="button">Choose</button></td>';
        body.appendChild(row);
      });
    }, 650);
  };

  var demoBtn = document.getElementById('runDemo');
  if (demoBtn) demoBtn.addEventListener('click', window.runDemoQuotes);

  /* ---------- WhatsApp / call links sitewide ---------- */
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    var msg = el.getAttribute('data-wa-msg') || 'Hi Verified Movers & Packers, I need a moving quote in Zirakpur.';
    el.setAttribute('href', waLink(msg));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
  document.querySelectorAll('[data-call]').forEach(function (el) {
    el.setAttribute('href', 'tel:+' + WHATSAPP_NUMBER);
  });
  document.querySelectorAll('[data-phone-display]').forEach(function (el) { el.textContent = PHONE_DISPLAY; });
  document.querySelectorAll('[data-email-display]').forEach(function (el) { el.textContent = BUSINESS_EMAIL; });

  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (i) { if (i !== item) i.classList.remove('open'); });
      item.classList.toggle('open', !isOpen);
    });
  });
})();
