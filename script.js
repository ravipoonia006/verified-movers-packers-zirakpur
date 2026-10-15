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

  /* ---------- Quote request form (supports the home form and compact city forms) ---------- */
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
      var digits = String(v || '').replace(/\D/g, '');
      // Accept 10-digit Indian mobiles, or 12-digit with country code 91
      if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
      if (digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1);
      return digits.length === 10 && /^[6-9]/.test(digits);
    }

    function validateDate(input) {
      if (!input || !input.value) return false;
      if (input.dataset.allowPast === 'true') return true;
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var selected = new Date(input.value + 'T00:00:00');
      return !Number.isNaN(selected.getTime()) && selected >= today;
    }

    function randomSlipNo(prefix) {
      return prefix + '-' + Math.floor(10000 + Math.random() * 89999);
    }

    function setResult(id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text || 'Not specified';
    }

    function pageContext() {
      var heading = document.querySelector('h1.headline') || document.querySelector('main h1');
      return (heading ? heading.textContent : document.title).replace(/\s+/g, ' ').trim();
    }

    function addWhatsAppFallback(message) {
      if (!successBox || successBox.querySelector('.quote-whatsapp-fallback')) return;
      var link = document.createElement('a');
      link.className = 'slip-submit quote-whatsapp-fallback';
      link.href = waLink(message);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'OPEN WHATSAPP AGAIN';
      successBox.appendChild(link);
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

      // The homepage has name/service fields; city landing pages intentionally use a compact form.
      // Validate fields when present, rather than throwing when a field is not part of that page.
      if (name) { if (!name.value.trim()) { fieldError(name, 'Required'); valid = false; } else fieldError(name); }
      if (from) { if (!from.value.trim()) { fieldError(from, 'Required'); valid = false; } else fieldError(from); }
      if (to) { if (!to.value.trim()) { fieldError(to, 'Required'); valid = false; } else fieldError(to); }
      if (size) { if (!size.value) { fieldError(size, 'Select one'); valid = false; } else fieldError(size); }
      if (service) { if (!service.value) { fieldError(service, 'Select one'); valid = false; } else fieldError(service); }
      if (date) { if (!validateDate(date)) { fieldError(date, 'Pick a valid date'); valid = false; } else fieldError(date); }
      if (phone) { if (!validatePhone(phone.value)) { fieldError(phone, 'Enter 10-digit number'); valid = false; } else fieldError(phone); }
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { fieldError(email, 'Enter a valid email'); valid = false; } else fieldError(email);
      if (!valid) return;

      var slipNo = randomSlipNo(formKind === 'vendor' ? 'VMP-V' : 'VMP');
      var moveDate = prettyDate(val(form, 'date'));
      var customerName = val(form, 'name') || 'Not provided on this page';
      var customerPhone = val(form, 'phone') || 'Not provided';
      var customerEmail = val(form, 'email') || 'Not provided';
      var serviceType = val(form, 'service') || 'Not selected on this page — please confirm';
      var extra = val(form, 'notes') || 'None specified';
      var context = pageContext();

      var messageLines = [
        '📦 NEW QUOTE REQUEST',
        '━━━━━━━━━━━━━━━━━━━━',
        'Reference: ' + slipNo,
        'Page: ' + context,
        'Customer: ' + customerName,
        'WhatsApp/Mobile: ' + customerPhone,
        'Email: ' + customerEmail,
        'Pickup: ' + (val(form, 'from') || 'Not specified'),
        'Drop: ' + (val(form, 'to') || 'Not specified'),
        'Move date: ' + moveDate,
        'Move size: ' + (val(form, 'size') || 'Not specified'),
        'Service: ' + serviceType,
        'Extra instructions: ' + extra
      ];

      // Include any additional named fields added to a page later, so their values are not lost.
      var standardNames = ['name', 'phone', 'email', 'from', 'to', 'date', 'size', 'service', 'notes'];
      Array.prototype.forEach.call(form.querySelectorAll('input[name], select[name], textarea[name]'), function (el) {
        if (standardNames.indexOf(el.name) !== -1 || ['submit', 'button', 'reset', 'hidden'].indexOf((el.type || '').toLowerCase()) !== -1) return;
        var value = (el.value || '').trim();
        if (!value) return;
        var field = el.closest('.field');
        var label = field && field.querySelector('label');
        var labelText = label ? label.textContent.replace(/\s+/g, ' ').trim() : el.name;
        messageLines.push(labelText + ': ' + value);
      });
      messageLines.push('━━━━━━━━━━━━━━━━━━━━', BUSINESS_NAME, 'Contact: ' + PHONE_DISPLAY + ' · ' + BUSINESS_EMAIL);
      var message = messageLines.join('\n');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'OPENING WHATSAPP…';
      }
      if (slipNoEl) slipNoEl.textContent = slipNo;
      if (stampTag) { stampTag.textContent = 'READY'; stampTag.classList.add('done'); }
      setResult('resultCustomer', customerName);
      setResult('resultRoute', (val(form, 'from') || 'Not specified') + ' → ' + (val(form, 'to') || 'Not specified'));
      setResult('resultDate', moveDate);
      setResult('resultPhone', customerPhone);
      setResult('resultService', serviceType);
      setResult('resultSize', val(form, 'size'));
      setResult('refEcho', slipNo);
      window._latestQuoteMessage = message;
      if (form) form.style.display = 'none';
      if (successBox) successBox.classList.add('show');

      // Open WhatsApp in the same user gesture (critical for mobile browsers).
      // window.open can be blocked; fall back to same-tab navigation + on-page retry button.
      var waUrl = waLink(message);
      var waWindow = null;
      try {
        waWindow = window.open(waUrl, '_blank');
      } catch (err) {
        waWindow = null;
      }
      if (waWindow) {
        try { waWindow.opener = null; } catch (ignore) { /* cross-browser hardening only */ }
      } else {
        addWhatsAppFallback(message);
        // Last-resort: navigate this tab to WhatsApp (works when popups are blocked).
        try {
          window.location.href = waUrl;
        } catch (navErr) { /* ignore */ }
      }

      var compareSection = document.getElementById('compare');
      if (compareSection && formKind !== 'vendor') {
        window.setTimeout(function () {
          compareSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (typeof runDemoQuotes === 'function') runDemoQuotes();
        }, 500);
      }
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

  /* Area / chip click → fill quote form + scroll (city pages) */
  document.querySelectorAll('a.locality-card[data-area], a.chip[data-area]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var area = el.getAttribute('data-area') || '';
      var city = el.getAttribute('data-city') || '';
      var form = document.getElementById('quoteForm');
      var fromInput = form && form.querySelector('[name="from"]');
      if (fromInput && area) {
        // Prefer putting locality in From; keep readable
        var label = area;
        if (city && area.toLowerCase().indexOf(city.toLowerCase()) === -1 && area.indexOf('→') === -1 && area.indexOf('->') === -1) {
          label = area + ', ' + city;
        }
        if (area.indexOf('→') !== -1 || area.indexOf('->') !== -1) {
          // route chip: "Zirakpur → Mohali"
          var parts = area.split(/→|->/).map(function (s) { return s.trim(); });
          if (parts[0] && form.querySelector('[name="from"]')) form.querySelector('[name="from"]').value = parts[0];
          if (parts[1] && form.querySelector('[name="to"]')) form.querySelector('[name="to"]').value = parts[1];
        } else if (area.toLowerCase().indexOf('packers') !== -1 || area.toLowerCase().indexOf('shifting') !== -1) {
          // search keyword chip — don't overwrite from; just scroll
        } else {
          fromInput.value = label;
        }
      }
      // allow hash navigation to #hero-form
    });
  });

  /* Full-site motion: page enter + expanded scroll reveals. Forms/WA unchanged. */
  (function initMotionSystem() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add(reduce ? 'motion-reduce' : 'motion-ready');
    if (!reduce) {
      requestAnimationFrame(function () {
        document.body.classList.add('page-entered');
      });
    } else {
      document.body.classList.add('page-entered');
    }

    var selectors = [
      '.hero > div', '.hero .headline', '.hero .sub', '.hero .eyebrow',
      '.moving-visual', '.slip', '.slip-form',
      '.section h2', '.section-title', '.section-title-sub', '.section-photo-banner',
      '.locality-card', '.why-card', '.compare-card', '.city-card',
      '.faq-item', '.visual-card', '.visual-gallery',
      '.br-card', '.br-value', '.contact-tile', '.contact-form-card',
      '.quote-card', '.quote-intro', '.hours-strip',
      '.split-panel', '.stamp-item', '.chip',
      'footer .footer-col', '.footer-brand',
      '.page-hero-br', '.truck-road'
    ].join(', ');

    var revealTargets = document.querySelectorAll(selectors);
    if (!revealTargets.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
      revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    revealTargets.forEach(function (el, index) {
      el.setAttribute('data-reveal', '');
      var dir = index % 3;
      if (dir === 1) el.setAttribute('data-reveal-from', 'left');
      else if (dir === 2) el.setAttribute('data-reveal-from', 'right');
      else el.setAttribute('data-reveal-from', 'up');
      el.style.setProperty('--reveal-delay', (index % 6) * 55 + 'ms');
    });

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -18px 0px' });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  })();

})();
