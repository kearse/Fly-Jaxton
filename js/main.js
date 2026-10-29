(function () {
  'use strict';
  const config = window.JAXTON_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const services = ['images', 'video', 'bundle', 'first'];
  const defaults = { images: 125, video: 200, bundle: 299 };
  const prices = Object.fromEntries(Object.keys(defaults).map(key => [key, validPrice(config.prices && config.prices[key], defaults[key])]));
  const intro = validPrice(config.introductoryPrice, 0);
  const money = (value) => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  let selected = 'first';
  let calendarMounted = false;
  let lastMountedService = '';
  let mountNumber = 0;
  let loadPromise;
  let calendarVisible = false;
  const calUrl = getCalUrl(config.calUrl);

  function validPrice(value, fallback) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  document.querySelectorAll('[data-price]').forEach(el => { el.textContent = money(prices[el.dataset.price]); });
  prices.first = intro;
  $('[data-intro-price]').textContent = intro === 0 ? 'Free' : money(intro);
  $('[data-intro-banner]').textContent = intro === 0 ? 'First shoot free' : 'First shoot ' + money(intro);
  $('[data-intro-cta]').textContent = intro === 0 ? 'Book your free shoot' : 'Book your first shoot';
  document.querySelector('meta[name="description"]').content = `Drone photos and video for Colorado Springs realtors. Same-day booking. Next-day delivery. First shoot ${intro === 0 ? 'free' : money(intro)}. 15 photos ${money(prices.images)}, video ${money(prices.video)}, bundle ${money(prices.bundle)}.`;
  document.querySelectorAll('.service-row').forEach(el => {
    const key = el.dataset.selectService;
    el.setAttribute('aria-label', `Book ${label(key)}: ${el.querySelector('p').textContent}, ${money(prices[key])}`);
  });
  for (let day = 1; day <= 30; day++) {
    const cell = document.createElement('span');
    cell.textContent = day;
    if (day === 18) cell.className = 'selected';
    $('#date-grid').appendChild(cell);
  }
  function label(key) { return key === 'first' ? 'First shoot' : key.charAt(0).toUpperCase() + key.slice(1); }
  function selectService(key) {
    if (!services.includes(key)) return;
    selected = key;
    $('#service-detail').textContent = key === 'images' ? '15 aerial photos' : key === 'video' ? 'Aerial video' : '15 aerial photos + aerial video';
    $('#service-qualifier').textContent = key === 'first' ? 'First-time clients only' : 'Ready within 24 hours of your shoot';
    document.querySelectorAll('input[name="service"]').forEach(input => { input.checked = input.value === key; });
    $('#selection-status').textContent = key === 'first'
      ? `First shoot selected. ${intro === 0 ? 'Free' : money(intro)} for new clients only. 15 aerial photos and aerial video. Regular bundle price ${money(prices.bundle)}.`
      : `${label(key)} selected. Regular price ${money(prices[key])}.`;
    updateDirectLink();
    if (calendarMounted || calendarVisible) mountCalendar();
  }
  document.querySelectorAll('input[name="service"]').forEach(input => {
    input.addEventListener('change', () => selectService(input.value));
  });
  document.querySelectorAll('a[href="#book"],a[href="#calendar"]').forEach(link => {
    link.addEventListener('click', () => {
      if (link.dataset.selectService) selectService(link.dataset.selectService);
      calendarVisible = true;
      mountCalendar();
      const target = $(link.getAttribute('href'));
      if (target && target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
    });
  });

  const timeScroll = $('.time-scroll');
  function syncTimeFade() {
    const more = timeScroll.scrollHeight > timeScroll.clientHeight + 1 && timeScroll.scrollTop + timeScroll.clientHeight < timeScroll.scrollHeight - 2;
    timeScroll.parentElement.classList.toggle('has-more', more);
  }
  timeScroll.addEventListener('scroll', syncTimeFade, { passive: true });
  window.addEventListener('resize', syncTimeFade);
  syncTimeFade();
  document.querySelectorAll('.time-slot').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.time-slot').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  }));
  $('.preview-continue').addEventListener('click', () => {
    $('#preview-message').textContent = 'Preview only — booking will be available when the calendar is connected. No appointment has been booked.';
  });

  const themeToggle = $('.theme-toggle');
  themeToggle.hidden = false;
  function syncTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
    $('.theme-label').textContent = dark ? 'Light mode' : 'Dark mode';
  }
  themeToggle.addEventListener('click', () => {
    const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = value;
    try { localStorage.setItem('jaxton-theme-v2', value); } catch (_) {}
    syncTheme();
  });
  syncTheme();

  function mediaPath(path) {
    return typeof path === 'string' && path.trim() && !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path.trim()) ? path.trim() : '';
  }
  if (mediaPath(config.heroImage)) $('#hero-photo').src = config.heroImage;
  let sampleCount = config.heroIsSample !== false ? 1 : 0;
  const galleryTargets = [$('#gallery-wide'), $('#gallery-overhead')];
  galleryTargets.forEach((img, i) => {
    const item = Array.isArray(config.gallery) ? config.gallery[i] : null;
    if (item && mediaPath(item.src)) {
      img.src = item.src;
      if (typeof item.alt === 'string') img.alt = item.alt;
      if (item.isSample !== false) sampleCount++;
    } else sampleCount++;
  });
  $('#gallery-sample-note').hidden = sampleCount === 0;

  const reviews = Array.isArray(config.reviews) ? config.reviews.filter(r => r && typeof r.quote === 'string' && r.quote.trim() && typeof r.name === 'string' && r.name.trim()) : [];
  let reviewIndex = 0;
  const previous = $('#review-prev');
  const next = $('#review-next');
  if (!reviews.length) {
    previous.disabled = next.disabled = true;
    if (config.showReviewPlaceholders === false) $('#reviews').hidden = true;
  } else {
    $('.review-stars').hidden = true; // A rating requires verified aggregate data.
    $('#reviews-caption').textContent = 'Client experiences';
    $('#review-name').hidden = false;
    previous.disabled = next.disabled = reviews.length < 2;
    renderReview();
    previous.addEventListener('click', () => { reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length; renderReview(); });
    next.addEventListener('click', () => { reviewIndex = (reviewIndex + 1) % reviews.length; renderReview(); });
    // Deliberately no automatic rotation: visitors control the reading pace.
  }
  function renderReview() {
    $('#review-quote').textContent = reviews[reviewIndex].quote;
    $('#review-name').textContent = '— ' + reviews[reviewIndex].name;
    $('#review-count').textContent = `Review ${reviewIndex + 1} of ${reviews.length}`;
  }
  try {
    const reviewUrl = new URL(config.googleReviewsUrl);
    if (reviewUrl.protocol === 'https:') {
      $('#google-reviews-link').href = reviewUrl.href;
      $('#google-reviews-link').target = '_blank';
      $('#google-reviews-link').rel = 'noopener';
    }
  } catch (_) {}

  function getCalUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.hostname !== 'cal.com' || url.username || url.password || url.port) return null;
      const path = url.pathname.replace(/^\/+|\/+$/g, '');
      if (!/^[a-z\d_.-]+(?:\/[a-z\d_.-]+){1,3}$/i.test(path) || /your-|example/i.test(path)) return null;
      return url;
    } catch (_) { return null; }
  }
  function bookingConfig() {
    const values = config.calServiceValues || {};
    const value = typeof values[selected] === 'string' ? values[selected] : label(selected);
    const prefill = { layout: 'month_view', theme: 'light', 'metadata[service]': value };
    const field = config.calServiceField;
    if (typeof field === 'string' && /^[a-zA-Z][\w-]*$/.test(field)) prefill[field] = value;
    return prefill;
  }
  function updateDirectLink() {
    if (!calUrl) return;
    const direct = new URL(calUrl.href);
    const prefill = bookingConfig();
    Object.keys(prefill).forEach(key => { if (key !== 'theme' && key !== 'layout') direct.searchParams.set(key, prefill[key]); });
    $('#external-booking').href = direct.href;
  }
  function loadCal() {
    if (loadPromise) return loadPromise;
    loadPromise = new Promise((resolve, reject) => {
      // Official buildless Cal.com loader. Calls queue until the script loads.
      (function (C, A, L) {
        const push = (api, args) => api.q.push(args);
        C.Cal = C.Cal || function () {
          const cal = C.Cal, args = arguments;
          if (!cal.loaded) {
            cal.ns = {}; cal.q = cal.q || [];
            const script = document.createElement('script');
            script.src = A; script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Calendar script could not load'));
            document.head.appendChild(script); cal.loaded = true;
          }
          if (args[0] === L) {
            const api = function () { push(api, arguments); };
            const namespace = args[1]; api.q = api.q || [];
            if (typeof namespace === 'string') {
              cal.ns[namespace] = cal.ns[namespace] || api;
              push(cal.ns[namespace], args); push(cal, ['initNamespace', namespace]);
            } else push(cal, args);
            return;
          }
          push(cal, args);
        };
      })(window, 'https://app.cal.com/embed/embed.js', 'init');
      window.Cal('init', 'jaxton', { origin: 'https://cal.com' });
    });
    return loadPromise;
  }
  async function mountCalendar() {
    if (!calUrl || lastMountedService === selected) return;
    const currentMount = ++mountNumber;
    const status = $('#cal-status');
    status.hidden = false; status.textContent = 'Loading your booking calendar…';
    $('#booking-fallback').hidden = false;
    updateDirectLink();
    try {
      await loadCal();
      if (currentMount !== mountNumber) return;
      $('#calendar-demo').hidden = true;
      const embed = $('#cal-embed');
      embed.hidden = false; embed.replaceChildren();
      window.Cal.ns.jaxton('inline', {
        elementOrSelector: '#cal-embed',
        calLink: calUrl.pathname.replace(/^\/+|\/+$/g, ''),
        config: { ...Object.fromEntries(calUrl.searchParams), ...bookingConfig() }
      });
      window.Cal.ns.jaxton('ui', {
        theme: 'light', hideEventTypeDetails: true, layout: 'month_view',
        cssVarsPerTheme: { light: {
          'cal-brand': '#D3F36B', 'cal-brand-emphasis': '#D3F36B', 'cal-brand-text': '#10151B',
          'cal-bg': '#F4F2EC', 'cal-bg-emphasis': '#F4F2EC', 'cal-bg-subtle': '#F4F2EC',
          'cal-text': '#171C20', 'cal-text-emphasis': '#171C20', 'cal-text-subtle': '#52616B',
          'cal-border': '#52616B', 'cal-border-emphasis': '#52616B'
        } }
      });
      lastMountedService = selected; calendarMounted = true;
      status.hidden = true;
    } catch (_) {
      $('#calendar-demo').hidden = true;
      status.textContent = 'The calendar could not load. Use the booking link below to choose a time.';
    }
  }
  if (calUrl) {
    $('#calendar-demo').hidden = true;
    $('#cal-status').hidden = false;
    $('#cal-status').textContent = 'Choose a service, then pick a time.';
    $('#booking-fallback').hidden = false;
    updateDirectLink();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          calendarVisible = true; mountCalendar(); observer.disconnect();
        }
      }, { rootMargin: '250px' });
      observer.observe($('#calendar'));
    } else { calendarVisible = true; mountCalendar(); }
  }
})();
