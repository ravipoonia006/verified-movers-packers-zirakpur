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

      // Track quote intent without passing customer details or claiming WhatsApp was sent.
      if (typeof window.vmpTrackEvent === 'function') { window.vmpTrackEvent('vmp_quote_request_ready', { form_kind: formKind, page_path: window.location.pathname }); }

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
      '.route-stop', '.svc-img', '.svc-box', '.svc-cta', '.hub-card', '.service-card',
      '.br-section > *', '.contact-tile', '.packing-compare', '.packing-step',
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


  /* Additive motion experiences: house-to-house journey + packing comparison slider.
     Existing contact, quote validation, and WhatsApp submission code remains untouched. */
  (function initMovingExperienceEnhancements() {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // A small animated journey visual below the existing four-step process on the homepage.
    var route = document.querySelector('#how .route');
    if (route && !document.querySelector('.moving-journey')) {
      var journey = document.createElement('div');
      journey.className = 'moving-journey';
      journey.setAttribute('role', 'img');
      journey.setAttribute('aria-label', 'Illustrated moving truck travelling from the pickup home to the new home');
      journey.innerHTML =
        '<div class="moving-journey__stop moving-journey__stop--start">' +
          '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M4 18 20 5l16 13v17H23V24h-7v11H4Z" fill="currentColor" opacity=".18"/><path d="M4 18 20 5l16 13M8 16v19h24V16M16 35V24h8v11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '<span>Pickup home</span>' +
        '</div>' +
        '<div class="moving-journey__track"><span class="moving-journey__route-line"></span><img class="moving-journey__truck" src="assets/truck-mini.svg" width="100" height="40" alt="" loading="lazy" decoding="async"></div>' +
        '<div class="moving-journey__stop moving-journey__stop--end">' +
          '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M4 18 20 5l16 13v17H23V24h-7v11H4Z" fill="currentColor" opacity=".18"/><path d="M4 18 20 5l16 13M8 16v19h24V16M16 35V24h8v11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '<span>New home</span>' +
        '</div>';
      route.insertAdjacentElement('afterend', journey);
      if (reduceMotion) journey.classList.add('motion-static');
    }

    // Before/after packing comparison on the existing packing service page only.
    var packingPage = document.body.classList.contains('theme-svc-packing') || /service-packing-services\.html$/i.test(window.location.pathname);
    var packingImage = document.querySelector('.svc-body .svc-img');
    if (packingPage && packingImage && !document.querySelector('.packing-compare')) {
      var compare = document.createElement('section');
      compare.className = 'packing-compare';
      compare.setAttribute('aria-labelledby', 'packing-compare-heading');
      compare.innerHTML =
        '<div class="packing-compare__intro">' +
          '<span class="packing-compare__eyebrow">Interactive packing preview</span>' +
          '<h2 id="packing-compare-heading">Compare furniture before and after protection</h2>' +
          '<p>Drag the slider to compare an unwrapped living-room setup with a protected, move-ready illustration.</p>' +
        '</div>' +
        '<div class="packing-compare__stage" style="--compare-split:50%">' +
          '<div class="packing-compare__image packing-compare__image--before"><img src="assets/packing-before.svg" alt="Illustration of furniture before protective packing" width="800" height="400" loading="lazy" decoding="async"><span class="packing-compare__label">BEFORE PROTECTION</span></div>' +
          '<div class="packing-compare__image packing-compare__image--after"><img src="assets/packing-after.svg" alt="Illustration of furniture protected with wrapping and packed cartons" width="800" height="400" loading="lazy" decoding="async"><span class="packing-compare__label">AFTER PROTECTION</span></div>' +
          '<div class="packing-compare__divider" aria-hidden="true"><span>↔</span></div>' +
          '<input class="packing-compare__range" type="range" min="0" max="100" value="50" aria-label="Move slider to compare before and after protective packing">' +
        '</div>' +
        '<div class="packing-steps" aria-label="Packing sequence">' +
          '<div class="packing-step"><span class="packing-step__number">01</span><div><strong>Wrap</strong><p>Prepare furniture and delicate surfaces.</p></div></div>' +
          '<div class="packing-step"><span class="packing-step__number">02</span><div><strong>Protect</strong><p>Add cushioning and secure loose parts.</p></div></div>' +
          '<div class="packing-step"><span class="packing-step__number">03</span><div><strong>Ready to move</strong><p>Keep packed items organized for handling.</p></div></div>' +
        '</div>';
      packingImage.insertAdjacentElement('afterend', compare);

      var slider = compare.querySelector('.packing-compare__range');
      var stage = compare.querySelector('.packing-compare__stage');
      var divider = compare.querySelector('.packing-compare__divider');
      function updatePackingSplit() {
        var value = Math.max(0, Math.min(100, Number(slider.value) || 0));
        stage.style.setProperty('--compare-split', value + '%');
        if (divider) divider.setAttribute('aria-valuenow', String(value));
      }
      slider.addEventListener('input', updatePackingSplit);
      updatePackingSplit();

      if (!reduceMotion && 'IntersectionObserver' in window) {
        var stepObserver = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('packing-step--visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.18 });
        compare.querySelectorAll('.packing-step').forEach(function (step) { stepObserver.observe(step); });
      } else {
        compare.querySelectorAll('.packing-step').forEach(function (step) { step.classList.add('packing-step--visible'); });
      }
    }

    // Add classes only; existing quote submit/WhatsApp code continues to own form behavior.
    document.querySelectorAll('form.slip-form').forEach(function (quoteForm) {
      quoteForm.classList.add('quote-form-motion');
    });

    // The floating WhatsApp control gets a single gentle halo on entry, never a constant pulse.
    document.querySelectorAll('.wa-float').forEach(function (button) {
      if (!reduceMotion) button.classList.add('wa-first-glance');
    });
  })();

  /* Reading progress + back-to-top utilities. These are decorative navigation aids only. */
  (function initScrollUtilities() {
    if (!document.body || document.querySelector('.reading-progress')) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';

    var topButton = document.createElement('button');
    topButton.className = 'back-to-top';
    topButton.type = 'button';
    topButton.setAttribute('aria-label', 'Back to top');
    topButton.setAttribute('title', 'Back to top');
    topButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    document.body.appendChild(progress);
    document.body.appendChild(topButton);

    var progressFill = progress.querySelector('span');
    var ticking = false;
    function updateScrollUI() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var scrollHeight = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      var amount = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
      progressFill.style.width = amount + '%';
      topButton.classList.toggle('is-visible', scrollTop > 420);
      topButton.setAttribute('aria-hidden', scrollTop > 420 ? 'false' : 'true');
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScrollUI);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    updateScrollUI();
  })();
})();

/* Conversion event hooks + accessible, progressive multi-step quote forms.
   No analytics IDs are invented. Events work with Google Tag Manager dataLayer;
   optional Google Ads conversion send_to values can be configured by the site owner. */
(function initVMPAnalyticsAndQuoteWizard() {
  'use strict';
  window.dataLayer = window.dataLayer || [];
  window.VMP_ANALYTICS_CONFIG = window.VMP_ANALYTICS_CONFIG || {};
  window.VMP_ANALYTICS_CONFIG.googleAds = window.VMP_ANALYTICS_CONFIG.googleAds || {
    callClickSendTo: '',
    whatsappClickSendTo: '',
    quoteReadySendTo: ''
  };
  var ads = window.VMP_ANALYTICS_CONFIG.googleAds;

  window.vmpTrackEvent = function (eventName, params) {
    var payload = { event: eventName, event_category: 'lead_intent', page_path: window.location.pathname };
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(function (key) {
        // Only accept non-sensitive scalar metadata; never send form values or PII.
        var value = params[key];
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') payload[key] = value;
      });
    }
    window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') {
      var gtagParams = {};
      Object.keys(payload).forEach(function (key) { if (key !== 'event') gtagParams[key] = payload[key]; });
      window.gtag('event', eventName, gtagParams);
      var sendTo = '';
      if (eventName === 'vmp_phone_click') sendTo = ads.callClickSendTo || '';
      if (eventName === 'vmp_whatsapp_click') sendTo = ads.whatsappClickSendTo || '';
      if (eventName === 'vmp_quote_request_ready') sendTo = ads.quoteReadySendTo || '';
      if (sendTo) window.gtag('event', 'conversion', { send_to: sendTo });
    }
  };

  // Delegated click tracking records the intent, not a completed call or sent WhatsApp message.
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var callLink = target.closest('a[data-call]');
    var whatsappLink = target.closest('a[data-wa]');
    if (callLink) {
      window.vmpTrackEvent('vmp_phone_click', { link_area: classifyArea(callLink) });
    }
    if (whatsappLink) {
      window.vmpTrackEvent('vmp_whatsapp_click', { link_area: classifyArea(whatsappLink) });
      if (whatsappLink.closest('.honest-feedback')) window.vmpTrackEvent('vmp_feedback_click', { link_area: 'customer_feedback' });
    }
  }, true);

  function classifyArea(link) {
    if (link.closest('nav')) return 'header';
    if (link.closest('.mobile-callbar')) return 'mobile_bottom_bar';
    if (link.closest('footer')) return 'footer';
    if (link.closest('.wa-float')) return 'floating_contact';
    if (link.closest('form')) return 'quote_form';
    if (link.closest('.honest-feedback')) return 'customer_feedback';
    if (link.closest('.contact-wrap, .contact-form-card')) return 'contact_page';
    return 'content';
  }

  function isValidPhone(value) {
    var digits = String(value || '').replace(/\D/g, '');
    if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
    if (digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1);
    return digits.length === 10 && /^[6-9]/.test(digits);
  }
  function isValidDate(value) {
    if (!value) return false;
    var selected = new Date(value + 'T00:00:00');
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(selected.getTime()) && selected >= today;
  }
  function validateStep(panel) {
    var okay = true;
    var firstInvalid = null;
    var fields = panel.querySelectorAll('input[name], select[name], textarea[name]');
    Array.prototype.forEach.call(fields, function (input) {
      var name = input.name;
      var value = String(input.value || '').trim();
      var message = '';
      if ((name === 'name' || name === 'from' || name === 'to') && !value) message = 'Required';
      else if ((name === 'size' || name === 'service') && !value) message = 'Select one';
      else if (name === 'phone' && !isValidPhone(value)) message = 'Enter a valid 10-digit Indian mobile number';
      else if (name === 'date' && !isValidDate(value)) message = 'Choose today or a future date';
      else if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Enter a valid email address';
      var field = input.closest('.field');
      var error = field && field.querySelector('.field-error');
      input.classList.toggle('has-error', !!message);
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      if (error) error.textContent = message;
      if (message) { okay = false; if (!firstInvalid) firstInvalid = input; }
    });
    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    }
    return okay;
  }

  function initWizard(form) {
    if (form.getAttribute('data-vmp-wizard') === 'ready') return;
    var requiredNames = ['name', 'phone', 'from', 'to', 'size', 'service', 'date'];
    var found = requiredNames.every(function (name) { return !!form.querySelector('[name="' + name + '"]'); });
    if (!found) return;
    var rows = Array.prototype.slice.call(form.children).filter(function (node) { return node.classList && node.classList.contains('field-row'); });
    if (rows.length < 3) return;

    var submit = form.querySelector('button[type="submit"], input[type="submit"]');
    var fine = form.querySelector('.slip-fine');
    var rowsSet = new Set(rows);
    var movedToEnd = new Set();
    if (submit) movedToEnd.add(submit);
    if (fine) movedToEnd.add(fine);
    var extraFields = Array.prototype.slice.call(form.children).filter(function (node) {
      return !rowsSet.has(node) && !movedToEnd.has(node) && !(node.matches && (node.matches('button[type="submit"]') || node.matches('input[type="submit"]') || node.matches('.slip-fine')));
    });

    var existingChildren = Array.prototype.slice.call(form.children);
    existingChildren.forEach(function (node) { if (node.parentNode === form) form.removeChild(node); });

    var titles = [
      { title: 'Your contact details', note: 'How can the team reach you about this moving request?' },
      { title: 'Tell us about the move', note: 'Add the pickup, destination, property size and service needed.' },
      { title: 'Schedule and extra details', note: 'Choose the date and share any special instructions.' }
    ];
    var wizardId = (form.id || 'quote') + '-wizard';
    var progress = document.createElement('div');
    progress.className = 'quote-wizard-progress';
    progress.setAttribute('role', 'group');
    progress.setAttribute('aria-label', 'Quote form steps');
    progress.innerHTML = '<span class="quote-wizard-progress__step" data-progress-step="0"><b>1</b><span>Contact</span></span><span class="quote-wizard-progress__line" aria-hidden="true"></span><span class="quote-wizard-progress__step" data-progress-step="1"><b>2</b><span>Move</span></span><span class="quote-wizard-progress__line" aria-hidden="true"></span><span class="quote-wizard-progress__step" data-progress-step="2"><b>3</b><span>Schedule</span></span>';
    form.appendChild(progress);
    var status = document.createElement('p');
    status.className = 'quote-wizard-status';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    form.appendChild(status);

    var panels = [];
    for (var stepIndex = 0; stepIndex < 3; stepIndex++) {
      var panel = document.createElement('section');
      panel.className = 'quote-wizard-step';
      panel.id = wizardId + '-step-' + (stepIndex + 1);
      panel.setAttribute('data-wizard-step', String(stepIndex));
      panel.setAttribute('aria-labelledby', wizardId + '-heading-' + (stepIndex + 1));
      var heading = document.createElement('h3');
      heading.className = 'quote-wizard-step__title';
      heading.id = wizardId + '-heading-' + (stepIndex + 1);
      heading.tabIndex = -1;
      heading.textContent = titles[stepIndex].title;
      var note = document.createElement('p');
      note.className = 'quote-wizard-step__note';
      note.textContent = titles[stepIndex].note;
      panel.appendChild(heading);
      panel.appendChild(note);
      panels.push(panel);
    }

    rows.forEach(function (row, index) {
      var group = index === 0 ? 0 : (index <= 2 ? 1 : 2);
      panels[group].appendChild(row);
    });
    // Extra fields not laid out in a .field-row stay in the final step.
    extraFields.forEach(function (node) { panels[2].appendChild(node); });
    panels.forEach(function (panel) { form.appendChild(panel); });

    var controls = panels.map(function (panel, index) {
      var bar = document.createElement('div');
      bar.className = 'quote-wizard-controls';
      if (index > 0) {
        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'quote-wizard-back';
        back.textContent = '← Back';
        back.addEventListener('click', function () { showStep(index - 1, true); });
        bar.appendChild(back);
      }
      if (index < panels.length - 1) {
        var next = document.createElement('button');
        next.type = 'button';
        next.className = 'quote-wizard-next';
        next.textContent = index === 0 ? 'Continue to move details →' : 'Continue to schedule →';
        next.addEventListener('click', function () {
          if (!validateStep(panel)) return;
          if (typeof window.vmpTrackEvent === 'function') window.vmpTrackEvent('vmp_quote_step_completed', { step_number: index + 1, page_path: window.location.pathname });
          showStep(index + 1, true);
        });
        bar.appendChild(next);
      } else if (submit) {
        bar.appendChild(submit);
      }
      panel.appendChild(bar);
      return bar;
    });
    if (fine) panels[2].appendChild(fine);
    // If the form has non-row hidden/helper nodes, retain them in the final panel.
    existingChildren.forEach(function (node) {
      if (!rowsSet.has(node) && !movedToEnd.has(node) && extraFields.indexOf(node) === -1) panels[2].appendChild(node);
    });

    var current = 0;
    function showStep(nextIndex, moveFocus) {
      current = Math.max(0, Math.min(panels.length - 1, nextIndex));
      panels.forEach(function (panel, index) {
        panel.hidden = index !== current;
        panel.setAttribute('aria-hidden', index === current ? 'false' : 'true');
      });
      Array.prototype.forEach.call(progress.querySelectorAll('[data-progress-step]'), function (el, index) {
        el.classList.toggle('is-current', index === current);
        el.classList.toggle('is-complete', index < current);
        if (index === current) el.setAttribute('aria-current', 'step');
        else el.removeAttribute('aria-current');
      });
      status.textContent = 'Step ' + (current + 1) + ' of ' + panels.length + ': ' + titles[current].title;
      if (moveFocus) {
        panels[current].querySelector('.quote-wizard-step__title').focus({ preventScroll: true });
        panels[current].scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
      }
    }
    form.setAttribute('data-vmp-wizard', 'ready');
    form.classList.add('quote-wizard-enabled');
    showStep(0, false);
  }

  Array.prototype.forEach.call(document.querySelectorAll('form.slip-form#quoteForm'), initWizard);
})();

