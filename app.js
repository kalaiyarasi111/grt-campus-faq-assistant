/* =====================================================================
   GRT CAMPUS FAQ ASSISTANT: application logic
   Single-page app, no build tools or paid services needed.
   Data lives in the browser (localStorage) for this demo.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('grt.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('grt.' + k, JSON.stringify(v)); } catch (e) { /* storage blocked: stay in memory */ } }
  };
  const sess = {
    get(k) { try { return sessionStorage.getItem('grt.' + k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem('grt.' + k, v); } catch (e) { /* ignore */ } },
    del(k) { try { sessionStorage.removeItem('grt.' + k); } catch (e) { /* ignore */ } }
  };
  const fmtTime = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fmtDateTime = ts => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const fmtDate = iso => { const d = new Date(iso + 'T00:00:00'); return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };

  /* ---------- icons (stroke style, one family) ---------- */
  const P = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8a5 5 0 0 1 0 8"/><path d="M19 5a9 9 0 0 1 0 14"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    calcheck: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    wallet: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    building: '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 10h.01"/><path d="M15 10h.01"/>',
    chevd: '<polyline points="6 9 12 15 18 9"/>',
    chevr: '<polyline points="9 18 15 12 9 6"/>',
    back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    up: '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
    down: '<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    cap: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/><line x1="22" y1="10" x2="22" y2="16"/>',
    bot: '<rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1"/><circle cx="9" cy="14" r="1.2"/><circle cx="15" cy="14" r="1.2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    bus: '<rect x="3" y="4" width="18" height="13" rx="2"/><line x1="3" y1="11" x2="21" y2="11"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    undo: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>'
  };
  const ic = (n, size) => `<svg class="ic" width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

  const MASCOT = `<svg class="mascot" viewBox="0 0 100 100" role="img" aria-label="Friendly campus assistant robot"><line x1="50" y1="12" x2="50" y2="24" stroke="#F2B33D" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="10" r="6" fill="#F2B33D"/><rect x="14" y="24" width="72" height="56" rx="22" fill="#1F5FD6"/><rect x="22" y="33" width="56" height="38" rx="16" fill="#EAF1FF"/><circle cx="38" cy="50" r="7" fill="#0B2A5B"/><circle cx="62" cy="50" r="7" fill="#0B2A5B"/><circle cx="40" cy="48" r="2.4" fill="#fff"/><circle cx="64" cy="48" r="2.4" fill="#fff"/><path d="M40 60q10 8 20 0" fill="none" stroke="#0B2A5B" stroke-width="3.5" stroke-linecap="round"/><rect x="6" y="40" width="9" height="22" rx="4.5" fill="#0B2A5B"/><rect x="85" y="40" width="9" height="22" rx="4.5" fill="#0B2A5B"/></svg>`;

  /* ---------- constants ---------- */
  const DEMO_USER = 'student', DEMO_PASS = 'campus123';
  const SUGGESTED = ['How much attendance do I need?', 'What is the exam pattern?', 'How can I apply for leave?', 'Where can I find placement details?', 'What is the fee structure?', 'What are the library timings?'];
  const UNCERTAIN = "Sorry, I couldn't find a verified answer to this question in my approved campus FAQ database. Please contact the college office for confirmation.";
  const GREETING = "Hi! I'm your GRT Campus Assistant. Ask me anything about campus FAQs, or choose a category to get started!";
  const NOTICE_TONES = { Exams: ['file', 'red'], Placements: ['briefcase', 'blue'], Events: ['star', 'orange'], Transport: ['bus', 'teal'] };
  const NOTICE_CATS = ['Exams', 'Placements', 'Events', 'Transport'];

  /* ---------- state ---------- */
  const S = {
    user: sess.get('user'),
    view: 'home',
    chat: [], busy: false, pending: null, prefill: '',
    recent: store.get('recent', []),
    unanswered: store.get('unanswered', []),
    feedback: store.get('feedback', {}),
    dailyFb: store.get('dailyFb', {}),
    customFaqs: store.get('customFaqs', []),
    notices: store.get('notices', null) || SAMPLE_NOTICES.map(n => Object.assign({ sample: true }, n)),
    theme: store.get('theme', ''),
    lang: store.get('lang', 'en'),
    faqCat: 'all', faqQuery: '', noticeCat: 'All', admin: false, unFilter: 'pending',
    dailyShown: false, homeFodShown: false, openNotice: {}
  };
  const allFaqs = () => FAQS.concat(S.customFaqs);
  let matcher = createMatcher(allFaqs());
  const getFaq = id => allFaqs().find(f => f.id === id);
  const getCat = id => CATEGORIES.find(c => c.id === id);
  const save = (k) => store.set(k, S[k]);

  function applyTheme() {
    const r = document.documentElement;
    if (S.theme) r.setAttribute('data-theme', S.theme); else r.removeAttribute('data-theme');
  }
  const isDark = () => S.theme ? S.theme === 'dark' : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);

  /* ---------- toast + modal ---------- */
  function toast(msg, kind) {
    let box = $('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || 'ok');
    t.innerHTML = `${ic(kind === 'warn' ? 'info' : 'check', 18)}<span>${esc(msg)}</span>`;
    box.appendChild(t);
    setTimeout(() => { t.remove(); }, 3200);
  }
  function openModal(inner, label) {
    const prev = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `<div class="modal-scrim" data-close></div><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">${inner}</div>`;
    document.body.appendChild(wrap);
    const dlg = $('.modal', wrap);
    const focusables = () => $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', dlg).filter(e => !e.disabled);
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey, true); if (prev && prev.focus) prev.focus(); };
    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      else if (e.key === 'Tab') {
        const f = focusables(); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    wrap.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    const f = focusables(); if (f.length) (dlg.querySelector('[data-autofocus]') || f[f.length > 1 ? 0 : 0]).focus();
    return { wrap, dlg, close };
  }
  function confirmDialog({ title, body, ok, danger }) {
    return new Promise(resolve => {
      const m = openModal(`<h2>${esc(title)}</h2><p>${esc(body)}</p><div class="ma"><button class="btn btn-ghost" data-close id="dlg-cancel">Cancel</button><button class="btn ${danger ? 'btn-danger' : ''}" id="dlg-ok" data-autofocus>${esc(ok || 'Confirm')}</button></div>`, title);
      let done = false;
      $('#dlg-ok', m.dlg).addEventListener('click', () => { done = true; m.close(); resolve(true); });
      const obs = new MutationObserver(() => { if (!document.body.contains(m.wrap)) { obs.disconnect(); if (!done) resolve(false); } });
      obs.observe(document.body, { childList: true });
    });
  }

  /* ---------- router ---------- */
  const NAV = [
    ['home', 'Home', 'home'], ['chat', 'Chat Assistant', 'chat'], ['faq-categories', 'FAQ Categories', 'grid'],
    ['notice-board', 'Campus Notice Board', 'megaphone'], ['faq-of-the-day', 'FAQ of the Day', 'bulb'],
    ['recent-questions', 'Recent Questions', 'clock'], ['unanswered-questions', 'Unanswered Questions', 'help'],
    ['contact-help', 'Contact Help', 'phone']
  ];
  const VIEWS = {
    'home': { render: viewHome },
    'chat': { render: viewChat, after: afterChat },
    'faq-categories': { render: viewFaqs, after: afterFaqs },
    'notice-board': { render: viewNotices },
    'faq-of-the-day': { render: viewDaily },
    'recent-questions': { render: viewRecent },
    'unanswered-questions': { render: viewUnanswered },
    'contact-help': { render: viewContact },
    'about': { render: viewAbout }
  };
  function go(name) { if (location.hash === '#' + name) renderView(); else location.hash = name; }
  function currentName() { const n = location.hash.slice(1); return VIEWS[n] ? n : 'home'; }

  function renderView() {
    if (!S.user) return renderLogin();
    if (!$('#main')) renderShell();
    const name = currentName();
    S.view = name;
    const v = VIEWS[name];
    $('#main').innerHTML = `<div class="page page-${name}">${v.render()}</div>`;
    $('#main').scrollTop = 0;
    if (v.after) v.after();
    updateChrome();
    document.body.classList.remove('nav-open');
    const menu = $('#menu-btn'); if (menu) menu.setAttribute('aria-expanded', 'false');
  }
  function updateChrome() {
    $$('.sidebar a[data-view]').forEach(a => { if (a.dataset.view === S.view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const clr = $('#clear-chat'); if (clr) clr.hidden = S.view !== 'chat';
    const pend = S.unanswered.filter(u => u.status === 'pending').length;
    const b = $('#pend-badge'); if (b) { b.textContent = pend; b.hidden = !pend; }
    const sw = $('#theme-sw'); if (sw) { sw.setAttribute('aria-checked', String(isDark())); sw.querySelector('.ico').innerHTML = isDark() ? ic('moon', 18) : ic('sun', 18); }
    const strip = $('#lang-strip'); if (strip) strip.hidden = S.lang === 'en';
    const sel = $('#lang'); if (sel) sel.value = S.lang;
  }

  /* ---------- login ---------- */
  function renderLogin(state) {
    document.body.classList.remove('nav-open');
    $('#root').innerHTML = `
      <div class="login">
        <div class="login-bar">${ic('cap', 26)}<span>GRT Campus FAQ Assistant</span><span class="grow"></span>
          <button class="top-btn" id="theme-sw-login" type="button" aria-label="Toggle light and dark mode">${isDark() ? ic('moon', 18) : ic('sun', 18)}<span class="tl">${isDark() ? 'Dark' : 'Light'}</span></button></div>
        <div class="login-main">
          <div class="glass" id="login-card">
            ${state === 'welcome' ? `
              <div class="welcome-ok" role="status"><div class="tick">${ic('check', 34)}</div><h2>Welcome, Student!</h2><p>Taking you to your campus dashboard...</p></div>` : `
            <div class="logo">${ic('cap', 30)}</div>
            <h1>Welcome Back!</h1>
            <p class="sub">Login to access your GRT Campus Assistant.</p>
            <form id="login-form" novalidate>
              <div id="login-alert" role="alert"></div>
              <div class="field"><label for="u">Username</label>
                <div class="input-wrap" id="u-wrap">${ic('user')}<input id="u" name="username" autocomplete="username" placeholder="Enter your username" aria-describedby="u-err"></div>
                <div class="err" id="u-err"></div></div>
              <div class="field"><label for="p">Password</label>
                <div class="input-wrap" id="p-wrap">${ic('lock')}<input id="p" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" aria-describedby="p-err">
                  <button class="icon-btn" type="button" id="pw-toggle" aria-label="Show password" aria-pressed="false">${ic('eye')}</button></div>
                <div class="err" id="p-err"></div></div>
              <button class="btn login-btn" id="login-btn" type="submit">Login</button>
            </form>
            <div class="demo-box"><strong>Demo login only.</strong> Username <code>${DEMO_USER}</code> and password <code>${DEMO_PASS}</code>. This is a classroom demonstration, not production-grade security. No real college account or personal data is used.
              <div><button class="btn btn-ghost btn-sm" type="button" id="fill-demo">Fill demo login</button></div></div>
            <p class="login-foot">For campus information, contact the college office.</p>`}
          </div>
        </div>
      </div>`;
    if (state !== 'welcome') { const u = $('#u'); if (u && window.matchMedia && matchMedia('(pointer:fine)').matches) u.focus(); }
  }
  function submitLogin() {
    const u = $('#u').value.trim(), p = $('#p').value;
    let bad = false;
    $('#login-alert').innerHTML = '';
    [['u', u, 'Please enter your username.'], ['p', p, 'Please enter your password.']].forEach(([id, val, msg]) => {
      $('#' + id + '-err').textContent = val ? '' : msg;
      $('#' + id + '-wrap').classList.toggle('bad', !val);
      if (!val) bad = true;
    });
    if (bad) { ($('#u').value ? $('#p') : $('#u')).focus(); return; }
    const btn = $('#login-btn'); btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Signing in...';
    setTimeout(() => {
      if (u.toLowerCase() === DEMO_USER && p === DEMO_PASS) {
        S.user = 'Student'; sess.set('user', 'Student');
        renderLogin('welcome');
        setTimeout(() => { if (!location.hash || location.hash === '#') location.hash = 'home'; renderView(); }, 1100);
      } else {
        btn.disabled = false; btn.textContent = 'Login';
        $('#login-alert').innerHTML = `<div class="alert err-box">${ic('alert', 18)}<span>Incorrect username or password. Check the demo login shown below and try again.</span></div>`;
        $('#p-wrap').classList.add('bad'); $('#u-wrap').classList.add('bad');
        $('#p').focus(); $('#p').select();
      }
    }, 800);
  }
  function logout() {
    S.user = null; sess.del('user'); S.chat = []; S.busy = false; location.hash = '';
    renderLogin();
    toast('You have been logged out.');
  }

  /* ---------- shell ---------- */
  function renderShell() {
    $('#root').innerHTML = `
      <a class="skip" href="#main">Skip to content</a>
      <div class="app">
        <header class="topbar">
          <button class="top-btn menu" id="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="sidebar">${ic('menu', 20)}</button>
          <div class="brand">${ic('cap', 26)}<span>GRT Campus FAQ Assistant</span></div>
          <div class="top-actions">
            <button class="top-btn" id="clear-chat" type="button" aria-label="Clear Chat" data-tip="Clear this conversation" hidden>${ic('trash', 16)}<span class="tl">Clear Chat</span></button>
            <label class="sr-only" for="lang">Language</label>
            <select class="lang" id="lang" title="Language"><option value="en">English</option><option value="ta">தமிழ் (Tamil)</option></select>
            <button class="switch" id="theme-sw" type="button" role="switch" aria-checked="false" aria-label="Dark mode" data-tip="Switch light / dark mode"><span class="ico"></span><span class="track"></span></button>
            <span class="who"><span class="ic-bubble">${ic('user', 16)}</span><span class="wt">Welcome, ${esc(S.user)}</span></span>
          </div>
        </header>
        <div class="notice-strip" id="lang-strip" role="status" hidden>${ic('info', 18)}<span>Tamil answers are not available yet. Everything is shown in English until verified Tamil translations of the approved FAQs are added.</span></div>
        <div class="shell">
          <nav class="sidebar" id="sidebar" aria-label="Main navigation">
            ${NAV.map(([id, label, icon]) => `<a href="#${id}" data-view="${id}" title="${esc(label)}">${ic(icon)}<span>${esc(label)}</span>${id === 'unanswered-questions' ? '<span class="badge" id="pend-badge" hidden>0</span>' : ''}</a>`).join('')}
            <div class="grow"></div><div class="sep"></div>
            <a class="about" href="#about" data-view="about" title="About this project and its architecture">${ic('info', 16)}<span>About &amp; architecture</span></a>
            <button class="nav" type="button" data-act="logout" title="Log out">${ic('logout')}<span>Logout</span></button>
          </nav>
          <div class="scrim" data-act="close-nav"></div>
          <main id="main" tabindex="-1"></main>
        </div>
      </div>`;
  }

  /* ---------- shared bits ---------- */
  const catTone = id => (getCat(id) || {}).tone || 'blue';
  const catName = id => (getCat(id) || { name: 'General' }).name;
  function fmtAnswer(a) { return esc(a).replace(/\[((?:Sample|Placeholder)[^\]]*)\]/g, '<span class="ph">$1</span>'); }
  const countFor = id => allFaqs().filter(f => f.cat === id).length;
  function fbButtons(kind, id, current) {
    const done = !!current;
    return `<div class="fb" role="group" aria-label="Was this answer helpful?">
      <button class="fb-btn up" type="button" data-act="${kind}" data-id="${esc(id)}" data-v="up" aria-pressed="${current === 'up'}" ${done ? 'disabled' : ''}>${ic('up', 16)} Helpful</button>
      <button class="fb-btn down" type="button" data-act="${kind}" data-id="${esc(id)}" data-v="down" aria-pressed="${current === 'down'}" ${done ? 'disabled' : ''}>${ic('down', 16)} Not helpful</button>
      <span class="fb-note" aria-live="polite">${current === 'up' ? 'Thanks for your feedback!' : current === 'down' ? 'Thanks. This answer is flagged for review.' : ''}</span></div>`;
  }
  function recordFeedback(faqId, v) {
    const r = S.feedback[faqId] || { up: 0, down: 0 };
    r[v] += 1; S.feedback[faqId] = r; save('feedback');
  }
  function emptyState(icon, title, text, btn) {
    return `<div class="card empty"><div class="ic-big">${ic(icon, 28)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${btn || ''}</div>`;
  }

  /* ---------- home ---------- */
  function dailyFaq() {
    const list = allFaqs(), d = new Date();
    const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
    return list[day % list.length];
  }
  function fodAnswerBlock(f, withFb) {
    return `<div class="fod-a"><div>${fmtAnswer(f.a)}</div>
      <div class="meta"><span class="tag tone-${catTone(f.cat)}">${esc(catName(f.cat))}</span><span class="tag">Source: Approved Campus FAQ</span>${f.sample ? '<span class="tag sample">Sample data</span>' : ''}</div>
      ${withFb || ''}</div>`;
  }
  function viewHome() {
    const f = dailyFaq();
    const recent = S.recent.slice(0, 4);
    return `
      <section class="hero" aria-label="Welcome banner"><div class="hero-in">
        <h1>Welcome to GRT Campus!</h1>
        <p>Your one-stop assistant for campus FAQs and information.</p>
        <button class="btn btn-gold" type="button" data-act="go" data-id="chat">${ic('chat', 18)} Ask a Question</button></div></section>
      <div class="home-grid">
        <div class="stack">
          <section aria-labelledby="qa-h"><h2 class="sec-title" id="qa-h">Quick Access Categories</h2>
            <div class="cat-grid">${CATEGORIES.map(c => `
              <button class="cat-card tone-${c.tone}" type="button" data-act="cat-open" data-id="${c.id}">
                <span class="ci">${ic(c.icon, 24)}</span><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p>
                <span class="count">${countFor(c.id)} questions ${ic('chevr', 16)}</span></button>`).join('')}</div></section>
          <section class="card" aria-labelledby="rq-h"><h2 id="rq-h">${ic('clock', 20)} Recent Questions</h2>
            ${recent.length ? `<ul class="mini-list">${recent.map(r => `<li><span class="mi tone-blue">${ic('chat', 16)}</span><span class="mt">${esc(r.q)}<small>${fmtDateTime(r.ts)}${r.cat ? ' · ' + esc(catName(r.cat)) : ''}</small></span>
              <button class="btn btn-ghost btn-sm" type="button" data-act="reopen" data-id="${esc(r.id)}">Reopen</button></li>`).join('')}</ul>
              <p style="margin-top:8px"><button class="link-btn" type="button" data-act="go" data-id="recent-questions">See all ${ic('chevr', 16)}</button></p>`
            : `<p style="color:var(--ink-2)">You have not asked anything yet. Your recent questions will appear here.</p>`}</section>
        </div>
        <div class="stack">
          <section class="card" aria-labelledby="fod-h"><h2 id="fod-h"><span style="color:var(--gold)">${ic('bulb', 22)}</span> FAQ of the Day</h2>
            <p class="fod-q">${esc(f.q)}</p>
            ${S.homeFodShown ? fodAnswerBlock(f, `<button class="btn btn-ghost btn-sm" type="button" data-act="prefill" data-id="${esc(f.id)}">Ask a related question</button>`)
              : `<button class="btn btn-sm" type="button" data-act="home-reveal">Reveal Answer</button>`}</section>
          <section class="card" aria-labelledby="nb-h"><h2 id="nb-h">${ic('megaphone', 20)} Campus Notice Board</h2>
            <p style="margin:-4px 0 8px"><span class="tag sample">Sample notices</span></p>
            <ul class="mini-list">${S.notices.slice(0, 4).map(n => { const t = NOTICE_TONES[n.cat] || ['megaphone', 'blue']; return `<li><span class="mi tone-${t[1]}">${ic(t[0], 16)}</span><span class="mt">${esc(n.title)}<small>${esc(n.cat)} · ${fmtDate(n.date)}</small></span></li>`; }).join('')}</ul>
            <p style="margin-top:8px"><button class="link-btn" type="button" data-act="go" data-id="notice-board">View all notices ${ic('chevr', 16)}</button></p></section>
        </div>
      </div>
      <section class="assistant-strip" aria-label="Welcome assistant">${MASCOT}
        <p class="msg-txt">${esc(GREETING)}</p>
        <button class="btn pulse" type="button" data-act="go" data-id="chat">${ic('chat', 18)} Ask me anything</button></section>`;
  }

  /* ---------- chat ---------- */
  function viewChat() {
    return `<div class="chat">
      <div class="chat-msgs" id="msgs" role="log" aria-live="polite" aria-label="Conversation with the campus assistant"></div>
      <div class="chat-suggest"><div class="sg-title">Suggested Questions</div>
        <div class="chips">${SUGGESTED.map(q => `<button class="chip" type="button" data-act="ask" data-text="${esc(q)}">${esc(q)}</button>`).join('')}</div></div>
      <form class="composer" id="chat-form" autocomplete="off">
        <div class="input-wrap">${ic('search', 18)}<label class="sr-only" for="chat-input">Type your question</label><input id="chat-input" maxlength="300" placeholder="Type your question here..."></div>
        <button class="send" id="send-btn" type="submit" aria-label="Send question">${ic('send', 20)}</button>
      </form></div>`;
  }
  function msgHTML(m, animate) {
    const cls = animate === false ? ' noanim' : '';
    if (m.role === 'user') return `<div class="msg user${cls}" data-mid="${m.id}"><div class="bubble">${esc(m.text)}</div><time>${fmtTime(m.ts)}</time></div>`;
    let inner = '';
    if (m.kind === 'greet') inner = `<div class="bubble">${esc(m.text)}</div>`;
    else if (m.kind === 'answer') {
      const f = getFaq(m.faqId);
      if (!f) inner = `<div class="bubble">${esc(m.text)}</div>`;
      else inner = `<div class="bubble">${fmtAnswer(f.a)}
          <div class="matched">Matched question: ${esc(f.q)}</div>
          <div class="ans-meta"><span class="tag tone-${catTone(f.cat)}">Category: ${esc(catName(f.cat))}</span><span class="tag">Source: Approved Campus FAQ</span>${f.sample ? '<span class="tag sample">Sample data</span>' : ''}<span class="tag">Confidence ${Math.round(m.conf * 100)}%</span></div></div>
          ${fbButtons('fb', m.id, m.fb)}`;
    } else if (m.kind === 'ambiguous') {
      inner = `<div class="bubble">I found a few approved questions that may be what you mean. Pick one:
        <div class="chips" style="margin-top:10px">${m.related.map(id => { const f = getFaq(id); return f ? `<button class="chip" type="button" data-act="ask" data-text="${esc(f.q)}">${esc(f.q)}</button>` : ''; }).join('')}</div></div>`;
    } else {
      inner = `<div class="bubble">${esc(UNCERTAIN)}
        ${m.related && m.related.length ? `<div class="matched" style="margin-top:10px">Closest approved questions:</div><div class="chips" style="margin-top:6px">${m.related.map(id => { const f = getFaq(id); return f ? `<button class="chip" type="button" data-act="ask" data-text="${esc(f.q)}">${esc(f.q)}</button>` : ''; }).join('')}</div>` : ''}
        <div class="ans-meta"><button class="btn btn-sm" type="button" data-act="go" data-id="contact-help">${ic('phone', 16)} Contact Help</button><span class="tag">Saved for administrator review</span></div></div>`;
    }
    return `<div class="msg bot${cls}" data-mid="${m.id}"><span class="avatar">${ic('bot', 20)}</span><div class="body">${inner}<time>${fmtTime(m.ts)}</time></div></div>`;
  }
  function scrollChat() { const el = $('#msgs'); if (el) el.scrollTop = el.scrollHeight; }
  function pushMsg(m) {
    S.chat.push(m);
    const el = $('#msgs');
    if (el) { el.insertAdjacentHTML('beforeend', msgHTML(m, true)); scrollChat(); }
  }
  function afterChat() {
    if (!S.chat.length) S.chat.push({ id: uid(), role: 'bot', kind: 'greet', text: GREETING, ts: Date.now() });
    const el = $('#msgs');
    el.innerHTML = S.chat.map(m => msgHTML(m, false)).join('');
    scrollChat();
    const input = $('#chat-input');
    if (S.prefill) { input.value = S.prefill; S.prefill = ''; }
    if (window.matchMedia && matchMedia('(pointer:fine)').matches) input.focus();
    if (S.busy) { showTyping(); $('#send-btn').disabled = true; }
    if (S.pending) { const p = S.pending; S.pending = null; send(p.text, p.opts); }
  }
  function showTyping() {
    const el = $('#msgs'); if (!el || $('#typing')) return;
    el.insertAdjacentHTML('beforeend', `<div class="msg bot typing" id="typing" aria-label="Assistant is typing"><span class="avatar">${ic('bot', 20)}</span><div class="body"><div class="bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div></div>`);
    scrollChat();
  }
  const hideTyping = () => { const t = $('#typing'); if (t) t.remove(); };

  function ask(text, opts) {
    if (S.view === 'chat') send(text, opts);
    else { S.pending = { text, opts: opts || {} }; go('chat'); }
  }
  function send(text, opts) {
    opts = opts || {};
    text = String(text || '').trim().slice(0, 300);
    if (!text) return;
    if (S.busy) { toast('One moment, the assistant is still answering.', 'warn'); return; }
    pushMsg({ id: uid(), role: 'user', text, ts: Date.now() });
    S.busy = true; const sb = $('#send-btn'); if (sb) sb.disabled = true;
    showTyping();
    setTimeout(() => {
      hideTyping();
      const r = matcher.match(text);
      let bot;
      if (r.status === 'match') {
        bot = { id: uid(), role: 'bot', kind: 'answer', faqId: r.best.faq.id, conf: r.confidence, ts: Date.now() };
        if (!opts.noLog) addRecent(text, r.best.faq.cat);
      } else if (r.status === 'ambiguous') {
        bot = { id: uid(), role: 'bot', kind: 'ambiguous', related: r.related.map(x => x.faq.id), ts: Date.now() };
        if (!opts.noLog) addRecent(text, null);
      } else {
        bot = { id: uid(), role: 'bot', kind: 'none', related: (r.related || []).map(x => x.faq.id), ts: Date.now() };
        if (!opts.noLog) addRecent(text, null);
        addUnanswered(text, r.best && r.best.score >= SUGGEST_THRESHOLD ? r.best.faq.cat : '');
      }
      pushMsg(bot);
      S.busy = false; const sb2 = $('#send-btn'); if (sb2) sb2.disabled = false;
      updateChrome();
    }, 650 + Math.random() * 450);
  }
  function addRecent(q, cat) {
    S.recent.unshift({ id: uid(), q, ts: Date.now(), cat: cat || null });
    S.recent = S.recent.slice(0, 50); save('recent');
  }
  function addUnanswered(q, cat) {
    const key = normalize(q);
    if (S.unanswered.some(u => u.status === 'pending' && normalize(u.q) === key)) return;
    S.unanswered.unshift({ id: uid(), q, ts: Date.now(), status: 'pending', cat: cat || '' });
    save('unanswered');
  }
  function clearChat() {
    confirmDialog({ title: 'Clear this conversation?', body: 'All messages in the chat window will be removed. Your recent questions list is kept.', ok: 'Clear Chat', danger: true }).then(yes => {
      if (!yes) return;
      S.chat = []; S.busy = false; S.pending = null;
      if (S.view === 'chat') afterChat();
      toast('Conversation cleared.');
    });
  }

  /* ---------- FAQ categories ---------- */
  function filteredFaqs() {
    const words = normalize(S.faqQuery).split(' ').filter(w => w.length > 1 && !STOPWORDS.has(w));
    return allFaqs().filter(f => {
      if (S.faqCat !== 'all' && f.cat !== S.faqCat) return false;
      if (!words.length) return true;
      const hay = normalize([f.q].concat(f.alts || [], [f.a, f.kw || '']).join(' ')) + ' ' + tokenize([f.q].concat(f.alts || [], [f.kw || '']).join(' ')).join(' ');
      return words.every(w => hay.includes(w) || tokenize(w).every(t => hay.includes(t)));
    });
  }
  function faqListHTML() {
    const list = filteredFaqs();
    const head = `<p class="count-line" id="faq-count" aria-live="polite">${list.length} ${list.length === 1 ? 'question' : 'questions'} found${S.faqCat !== 'all' ? ' in ' + esc(catName(S.faqCat)) : ''}${S.faqQuery.trim() ? ' for "' + esc(S.faqQuery.trim()) + '"' : ''}</p>`;
    if (!list.length) return head + emptyState('search', 'No matching questions', 'Try different words or another category. You can also ask the assistant directly.',
      S.faqQuery.trim() ? `<button class="btn" type="button" data-act="ask" data-text="${esc(S.faqQuery.trim())}">${ic('chat', 18)} Ask in Chat</button>` : '');
    return head + `<div class="faq-list">${list.map(f => {
      const fb = S.feedback[f.id];
      return `<details class="faq"><summary><span class="q">${esc(f.q)}</span><span class="tag tone-${catTone(f.cat)}">${esc(catName(f.cat))}</span><span class="chev">${ic('chevd', 18)}</span></summary>
        <div class="faq-body"><div class="ans">${fmtAnswer(f.a)}</div>
          <div class="row"><span class="tag">Source: Approved Campus FAQ</span>${f.sample ? '<span class="tag sample">Sample data</span>' : ''}${f.custom ? '<span class="tag ok">Added by admin (demo)</span>' : ''}
            ${fb ? `<span class="tag">${ic('up', 13)} ${fb.up} &nbsp; ${ic('down', 13)} ${fb.down}</span>` : ''}<span class="grow"></span>
            <button class="btn btn-sm" type="button" data-act="ask" data-text="${esc(f.q)}">${ic('chat', 16)} Ask in Chat</button></div></div></details>`;
    }).join('')}</div>`;
  }
  function viewFaqs() {
    return `<div class="page-head"><div><h1>${ic('grid', 26)} FAQ Categories</h1><p class="lead">Browse every approved campus FAQ. Pick a category or search by keyword.</p></div></div>
      <div class="toolbar">
        <div class="input-wrap search">${ic('search', 18)}<label class="sr-only" for="faq-search">Search FAQs</label><input id="faq-search" type="search" placeholder="Search questions, e.g. library, leave, hall ticket" value="${esc(S.faqQuery)}"></div>
        <div class="chips" id="faq-chips" role="group" aria-label="Filter by category">${faqChips()}</div></div>
      <div id="faq-results">${faqListHTML()}</div>`;
  }
  function faqChips() {
    return `<button class="chip" type="button" data-act="faq-cat" data-id="all" aria-pressed="${S.faqCat === 'all'}">All (${allFaqs().length})</button>` +
      CATEGORIES.map(c => `<button class="chip" type="button" data-act="faq-cat" data-id="${c.id}" aria-pressed="${S.faqCat === c.id}">${esc(c.name)} (${countFor(c.id)})</button>`).join('');
  }
  function afterFaqs() {
    const s = $('#faq-search');
    s.addEventListener('input', () => { S.faqQuery = s.value; $('#faq-results').innerHTML = faqListHTML(); });
  }

  /* ---------- notices ---------- */
  function noticeCard(n) {
    const t = NOTICE_TONES[n.cat] || ['megaphone', 'blue'];
    const open = !!S.openNotice[n.id];
    return `<article class="card notice"><div class="top"><span class="ni tone-${t[1]}">${ic(t[0], 22)}</span><div style="min-width:0"><h3>${esc(n.title)}</h3><div class="when">${fmtDate(n.date)}</div></div></div>
      <div class="tags"><span class="tag tone-${t[1]}">${esc(n.cat)}</span>${n.priority === 'High' ? '<span class="tag hi">High priority</span>' : ''}${n.sample ? '<span class="tag sample">Sample notice</span>' : '<span class="tag ok">Added in demo admin</span>'}</div>
      <p class="desc ${open ? '' : 'clamp'}">${esc(n.desc)}</p>
      <div class="acts"><button class="btn btn-ghost btn-sm" type="button" data-act="notice-more" data-id="${esc(n.id)}" aria-expanded="${open}">${open ? 'Show Less' : 'Read More'}</button>
        ${S.admin ? `<button class="btn btn-ghost btn-sm" type="button" data-act="notice-edit" data-id="${esc(n.id)}">${ic('edit', 14)} Edit</button><button class="btn btn-ghost btn-sm" type="button" data-act="notice-del" data-id="${esc(n.id)}">${ic('trash', 14)} Remove</button>` : ''}</div></article>`;
  }
  function viewNotices() {
    const list = S.notices.filter(n => S.noticeCat === 'All' || n.cat === S.noticeCat).sort((a, b) => b.date.localeCompare(a.date));
    return `<div class="page-head"><div><h1>${ic('megaphone', 26)} Campus Notice Board</h1><p class="lead">Announcements by category. All notices shown here are samples for the demonstration, not official college notices.</p></div>
        <div class="switch-row"><button class="switch" type="button" role="switch" id="admin-sw" data-act="admin-toggle" aria-checked="${S.admin}" aria-label="Admin demo mode"><span class="track"></span></button><span>Admin demo mode</span></div></div>
      ${S.admin ? `<div class="alert warn-box">${ic('info', 18)}<span>Demonstration feature. Anyone using this page can edit notices; it is not a secure admin system.</span></div><p style="margin-bottom:14px"><button class="btn" type="button" data-act="notice-add">${ic('plus', 18)} Add notice</button></p>` : ''}
      <div class="chips" style="margin-bottom:16px" role="group" aria-label="Filter notices">${['All'].concat(NOTICE_CATS).map(c => `<button class="chip" type="button" data-act="notice-cat" data-id="${c}" aria-pressed="${S.noticeCat === c}">${c}</button>`).join('')}</div>
      ${list.length ? `<div class="notice-grid">${list.map(noticeCard).join('')}</div>` : emptyState('megaphone', 'No notices in this category', 'Choose another category to see more announcements.', `<button class="btn" type="button" data-act="notice-cat" data-id="All">Show all notices</button>`)}`;
  }
  function noticeForm(n) {
    const v = n || { title: '', cat: 'Exams', priority: 'Normal', date: new Date().toISOString().slice(0, 10), desc: '' };
    const m = openModal(`<h2>${n ? 'Edit notice' : 'Add notice'}</h2><form id="notice-form" novalidate><div class="mb">
      <div><label for="nf-t">Title</label><input class="txt" id="nf-t" value="${esc(v.title)}" maxlength="120" data-autofocus></div>
      <div><label for="nf-c">Category</label><select class="sel" id="nf-c">${NOTICE_CATS.map(c => `<option ${c === v.cat ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <div><label for="nf-p">Priority</label><select class="sel" id="nf-p">${['Normal', 'High'].map(c => `<option ${c === v.priority ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <div><label for="nf-d">Publication date</label><input class="txt" id="nf-d" type="date" value="${esc(v.date)}"></div>
      <div><label for="nf-s">Short description</label><textarea class="txt" id="nf-s" maxlength="400">${esc(v.desc)}</textarea></div>
      <div class="err" id="nf-err" role="alert"></div></div>
      <div class="ma"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save notice</button></div></form>`, n ? 'Edit notice' : 'Add notice');
    $('#notice-form', m.dlg).addEventListener('submit', e => {
      e.preventDefault();
      const t = $('#nf-t', m.dlg).value.trim(), d = $('#nf-s', m.dlg).value.trim(), date = $('#nf-d', m.dlg).value;
      if (!t || !d || !date) { $('#nf-err', m.dlg).textContent = 'Please fill in the title, date and description.'; return; }
      const rec = { title: t, cat: $('#nf-c', m.dlg).value, priority: $('#nf-p', m.dlg).value, date, desc: d };
      if (n) Object.assign(n, rec); else S.notices.unshift(Object.assign({ id: uid(), sample: false }, rec));
      save('notices'); m.close(); renderView(); toast(n ? 'Notice updated.' : 'Notice added.');
    });
  }

  /* ---------- FAQ of the day ---------- */
  function viewDaily() {
    const f = dailyFaq();
    const key = new Date().toDateString() + ':' + f.id;
    const cur = S.dailyFb[key];
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return `<div class="daily"><div class="page-head"><div><h1><span style="color:var(--gold)">${ic('bulb', 28)}</span> FAQ of the Day</h1><p class="lead">${esc(today)}. One approved question appears each day to help you learn something new.</p></div></div>
      <section class="card"><span class="tag tone-${catTone(f.cat)}">${esc(catName(f.cat))}</span>
        <p class="big-q">${esc(f.q)}</p>
        ${S.dailyShown ? `<div class="fod-a">${fmtAnswer(f.a)}<div class="meta"><span class="tag tone-${catTone(f.cat)}">${esc(catName(f.cat))}</span><span class="tag">Source: Approved Campus FAQ</span>${f.sample ? '<span class="tag sample">Sample data</span>' : ''}</div>
            <div class="fb" style="margin-top:6px" role="group" aria-label="Was this answer helpful?">
              <button class="fb-btn up" type="button" data-act="fb-daily" data-id="${esc(key)}" data-faq="${esc(f.id)}" data-v="up" aria-pressed="${cur === 'up'}" ${cur ? 'disabled' : ''}>${ic('up', 16)} Helpful</button>
              <button class="fb-btn down" type="button" data-act="fb-daily" data-id="${esc(key)}" data-faq="${esc(f.id)}" data-v="down" aria-pressed="${cur === 'down'}" ${cur ? 'disabled' : ''}>${ic('down', 16)} Not helpful</button>
              <span class="fb-note" aria-live="polite">${cur === 'up' ? 'Thanks for your feedback!' : cur === 'down' ? 'Thanks. This answer is flagged for review.' : ''}</span></div></div>
          <p style="margin-top:14px"><button class="btn" type="button" data-act="ask" data-text="${esc(f.q)}">${ic('chat', 18)} Ask This Question</button></p>`
        : `<button class="btn" type="button" data-act="daily-reveal">Reveal Answer</button>`}</section>
      <p style="margin-top:16px;color:var(--ink-2)">Only one FAQ is shown each day. Curious about more? <button class="link-btn" type="button" data-act="go" data-id="faq-categories">Explore all FAQs ${ic('chevr', 16)}</button></p></div>`;
  }

  /* ---------- recent ---------- */
  function viewRecent() {
    return `<div class="page-head"><div><h1>${ic('clock', 26)} Recent Questions</h1><p class="lead">Your latest questions, newest first. They are stored only in this browser.</p></div>
      ${S.recent.length ? `<button class="btn btn-ghost btn-sm" type="button" data-act="clear-recent">${ic('trash', 14)} Clear history</button>` : ''}</div>
      ${S.recent.length ? `<div class="rows">${S.recent.map(r => `<div class="row-card"><div class="main"><div class="q">${esc(r.q)}</div><div class="sub"><span>${fmtDateTime(r.ts)}</span>${r.cat ? `<span class="tag tone-${catTone(r.cat)}">${esc(catName(r.cat))}</span>` : '<span class="tag">No category matched</span>'}</div></div>
        <div class="acts"><button class="btn btn-sm" type="button" data-act="reopen" data-id="${esc(r.id)}">${ic('chat', 16)} Reopen in chat</button></div></div>`).join('')}</div>`
      : emptyState('clock', 'No questions yet', 'Ask the assistant something and it will show up here so you can reopen it later.', `<button class="btn" type="button" data-act="go" data-id="chat">${ic('chat', 18)} Ask a Question</button>`)}`;
  }

  /* ---------- unanswered (admin demo) ---------- */
  function viewUnanswered() {
    const pend = S.unanswered.filter(u => u.status === 'pending').length, rev = S.unanswered.length - pend;
    const list = S.unanswered.filter(u => S.unFilter === 'all' || u.status === S.unFilter);
    const rated = allFaqs().filter(f => S.feedback[f.id]).map(f => ({ f, up: S.feedback[f.id].up, down: S.feedback[f.id].down })).sort((a, b) => (b.down - b.up) - (a.down - a.up));
    return `<div class="page-head"><div><h1>${ic('help', 26)} Unanswered Questions</h1><p class="lead">Questions the assistant could not answer from the approved FAQs. Review them and add a verified answer when one is available.</p></div></div>
      <div class="alert warn-box">${ic('info', 18)}<span>Demonstration admin screen. It has no login protection and is not a secure administrative system. Nothing is added to the approved FAQs unless you review and confirm it.</span></div>
      <div class="stats"><div class="stat"><b>${pend}</b><span>Pending review</span></div><div class="stat"><b>${rev}</b><span>Reviewed</span></div><div class="stat"><b>${S.unanswered.length}</b><span>Total saved</span></div></div>
      <div class="chips" style="margin-bottom:14px" role="group" aria-label="Filter by status">${[['pending', 'Pending'], ['reviewed', 'Reviewed'], ['all', 'All']].map(([id, l]) => `<button class="chip" type="button" data-act="un-filter" data-id="${id}" aria-pressed="${S.unFilter === id}">${l}</button>`).join('')}</div>
      ${list.length ? `<div class="rows">${list.map(u => `<div class="row-card"><div class="main"><div class="q">${esc(u.q)}</div>
          <div class="sub"><span>${fmtDateTime(u.ts)}</span><span class="tag ${u.status === 'pending' ? 'sample' : 'ok'}">${u.status === 'pending' ? 'Pending' : 'Reviewed'}</span>
          <label class="sr-only" for="sc-${esc(u.id)}">Suggested category</label>
          <select class="sel" id="sc-${esc(u.id)}" data-act="un-cat" data-id="${esc(u.id)}"><option value="">Suggested category: none</option>${CATEGORIES.map(c => `<option value="${c.id}" ${u.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div></div>
          <div class="acts"><button class="btn btn-ghost btn-sm" type="button" data-act="un-toggle" data-id="${esc(u.id)}">${u.status === 'pending' ? ic('check', 14) + ' Mark reviewed' : ic('undo', 14) + ' Mark pending'}</button>
            <button class="btn btn-sm" type="button" data-act="un-add" data-id="${esc(u.id)}">${ic('plus', 14)} Add approved FAQ</button>
            <button class="btn btn-ghost btn-sm" type="button" data-act="un-del" data-id="${esc(u.id)}" aria-label="Remove this entry">${ic('trash', 14)}</button></div></div>`).join('')}</div>`
      : emptyState('inbox', S.unFilter === 'pending' ? 'Nothing waiting for review' : 'No entries here', 'When the assistant cannot find a verified answer, the question is saved here for review.', `<button class="btn" type="button" data-act="go" data-id="chat">${ic('chat', 18)} Try a question in chat</button>`)}
      <section class="card" style="margin-top:22px"><h2>${ic('up', 20)} FAQ feedback</h2>
        ${rated.length ? `<div class="tbl-wrap"><table class="fbt"><thead><tr><th>Question</th><th>Helpful</th><th>Not helpful</th><th>Status</th></tr></thead><tbody>${rated.map(r => `<tr><td>${esc(r.f.q)}</td><td>${r.up}</td><td>${r.down}</td><td>${r.down > r.up ? '<span class="tag hi">Needs improvement</span>' : '<span class="tag ok">Looks good</span>'}</td></tr>`).join('')}</tbody></table></div>`
          : '<p style="color:var(--ink-2)">No feedback yet. Use the Helpful and Not helpful buttons under chat answers.</p>'}</section>`;
  }
  function addFaqDialog(u) {
    const m = openModal(`<h2>Add approved FAQ</h2><p style="color:var(--ink-2)">Only add an answer after it has been verified with the college office.</p>
      <form id="faq-form" novalidate><div class="mb">
        <div><label for="af-q">Question</label><input class="txt" id="af-q" value="${esc(u.q)}" maxlength="200" data-autofocus></div>
        <div><label for="af-c">Category</label><select class="sel" id="af-c">${CATEGORIES.map(c => `<option value="${c.id}" ${u.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div><label for="af-a">Verified answer</label><textarea class="txt" id="af-a" maxlength="800"></textarea></div>
        <label class="checkrow"><input type="checkbox" id="af-ok"><span>I confirm this answer has been verified with the college office.</span></label>
        <div class="err" id="af-err" role="alert"></div></div>
      <div class="ma"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Add to approved FAQs</button></div></form>`, 'Add approved FAQ');
    $('#faq-form', m.dlg).addEventListener('submit', e => {
      e.preventDefault();
      const q = $('#af-q', m.dlg).value.trim(), a = $('#af-a', m.dlg).value.trim();
      if (!q || !a) { $('#af-err', m.dlg).textContent = 'Please enter both the question and the verified answer.'; return; }
      if (!$('#af-ok', m.dlg).checked) { $('#af-err', m.dlg).textContent = 'Please confirm the answer has been verified before adding it.'; return; }
      S.customFaqs.push({ id: 'x' + uid(), cat: $('#af-c', m.dlg).value, q, alts: q !== u.q ? [u.q] : [], kw: '', a, sample: false, custom: true });
      save('customFaqs'); matcher = createMatcher(allFaqs());
      u.status = 'reviewed'; save('unanswered');
      m.close(); renderView(); toast('FAQ added to the approved dataset (demo).');
    });
  }

  /* ---------- contact ---------- */
  function viewContact() {
    const rows = [['office', 'building', 'Office'], ['phone', 'phone', 'Phone'], ['email', 'inbox', 'Email'], ['location', 'building', 'Location'], ['hours', 'clock', 'Office hours']].filter(([k]) => CONTACT[k]);
    return `<div class="page-head"><div><h1>${ic('phone', 26)} Contact Help</h1></div></div>
      <section class="card" style="max-width:720px"><div class="prose">
        <p>This assistant only answers questions from the approved campus FAQs. It does not guess or make up college rules, fees, dates or schedules.</p>
        <p>If you do not get an answer, or you need to confirm something, please contact the college office directly.</p></div>
        ${rows.length ? `<div class="contact-list">${rows.map(([k, i, l]) => `<div>${ic(i, 18)}<span><strong>${l}:</strong> <span style="user-select:all">${esc(CONTACT[k])}</span></span></div>`).join('')}</div>`
          : `<div class="alert info-box" style="margin-top:14px">${ic('info', 18)}<span>Official contact details have not been added yet. The project owner can add verified office details in the <code class="k">CONTACT</code> section of the data file.</span></div>`}
        <p style="margin-top:16px;display:flex;flex-wrap:wrap;gap:10px"><button class="btn" type="button" data-act="go" data-id="chat">${ic('back', 18)} Back to Chat</button>
          <button class="btn btn-ghost" type="button" data-act="go" data-id="faq-categories">Browse FAQs</button></p></section>`;
  }

  /* ---------- about + architecture ---------- */
  function archSvg() {
    const li = (x, y, items) => items.map((t, i) => `<text class="li" x="${x}" y="${y + i * 22}">• ${t}</text>`).join('');
    return `<svg class="arch" viewBox="0 0 1160 470" role="img" aria-labelledby="arch-t arch-d">
      <title id="arch-t">System architecture</title>
      <desc id="arch-d">A student uses the web interface. The question goes to the FAQ matching engine, which checks for a match. If a match is found, a verified answer from the approved FAQ dataset is displayed with category, source and feedback. If not, the assistant admits uncertainty and the question is saved in the unanswered question tracker.</desc>
      <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink-2)"/></marker></defs>
      <circle class="person" cx="62" cy="178" r="22"/><path class="person" d="M22 262c0-24 18-38 40-38s40 14 40 38z"/>
      <text class="h" x="62" y="292" text-anchor="middle">Student</text><text class="s" x="62" y="312" text-anchor="middle">Types a question</text><text class="s" x="62" y="328" text-anchor="middle">or picks a category</text>
      <rect class="box b-blue" x="150" y="80" width="200" height="270" rx="16"/>
      <text class="h" x="250" y="112" text-anchor="middle">Web Interface</text><text class="s" x="250" y="131" text-anchor="middle">(Streamlit in the original plan)</text>
      ${li(172, 168, ['Chat', 'Categories', 'Search', 'Suggested questions', 'Light / Dark mode', 'Feedback'])}
      <rect class="box b-purple" x="390" y="80" width="200" height="270" rx="16"/>
      <text class="h" x="490" y="112" text-anchor="middle">FAQ Matching Engine</text>
      ${li(412, 160, ['Text normalisation', 'Keyword / semantic', 'matching', 'Approved FAQ retrieval', 'Confidence checking'])}
      <polygon class="box b-gold" points="700,150 790,215 700,280 610,215"/>
      <text class="h" x="700" y="212" text-anchor="middle">Match</text><text class="h" x="700" y="231" text-anchor="middle">found?</text>
      <rect class="box b-green" x="830" y="20" width="200" height="150" rx="16"/>
      <text class="h" x="930" y="50" text-anchor="middle">Display Verified Answer</text>
      ${li(856, 82, ['Answer', 'Category', 'Source', 'Feedback (helpful / not)'])}
      <rect class="box b-red" x="830" y="290" width="200" height="150" rx="16"/>
      <text class="h" x="930" y="320" text-anchor="middle">Admit Uncertainty</text>
      <text class="s" x="930" y="346" text-anchor="middle">Asks the student to confirm</text><text class="s" x="930" y="364" text-anchor="middle">with the college office</text><text class="s" x="930" y="382" text-anchor="middle">and offers Contact Help</text>
      <path class="box b-teal" d="M1060 70v70c0 12 25 22 50 22s50-10 50-22V70"/><ellipse class="box b-teal" cx="1110" cy="70" rx="50" ry="20"/>
      <text class="h" x="1110" y="108" text-anchor="middle">FAQ Dataset</text><text class="s" x="1110" y="128" text-anchor="middle">Approved only</text>
      <path class="box b-teal" d="M1060 340v60c0 12 25 22 50 22s50-10 50-22v-60"/><ellipse class="box b-teal" cx="1110" cy="340" rx="50" ry="20"/>
      <text class="h" x="1110" y="378" text-anchor="middle">Unanswered</text><text class="h" x="1110" y="396" text-anchor="middle">Tracker</text>
      <path class="ln" d="M102 215H148" marker-end="url(#ah)"/><path class="ln" d="M350 215H388" marker-end="url(#ah)"/><path class="ln" d="M590 215H608" marker-end="url(#ah)"/>
      <path class="ln" d="M700 150V95H828" marker-end="url(#ah)"/><text class="lbl yes" x="740" y="88">Yes</text>
      <path class="ln" d="M700 280V365H828" marker-end="url(#ah)"/><text class="lbl no" x="740" y="388">No</text>
      <path class="ln" d="M1060 100H1034" marker-end="url(#ah)"/><path class="ln" d="M1032 365H1058" marker-end="url(#ah)"/>
    </svg>`;
  }
  function viewAbout() {
    return `<div class="page-head"><div><h1>${ic('info', 26)} About &amp; Architecture</h1><p class="lead">GRT Campus FAQ Assistant for GRT Institute of Engineering and Technology, Tiruttani. A capstone demonstration that answers only from an approved FAQ dataset.</p></div></div>
      <section class="card"><h2>System architecture</h2>
        <div class="arch-scroll" tabindex="0" aria-label="Architecture diagram, scrolls sideways on small screens">${archSvg()}</div>
        <ol class="prose flow"><li>The student asks a question in the chat, or browses and searches categories.</li><li>The matching engine normalises the text, maps wording variants to common terms, and scores it against the approved FAQs only.</li><li>If the confidence is high enough, the verified answer is shown with its category, source and feedback buttons.</li><li>If not, the assistant says it does not know, points to the college office, and saves the question for review.</li></ol></section>
      <div class="home-grid" style="margin-top:20px">
        <section class="card"><h2>How matching works</h2><div class="prose"><ul>
          <li>Lower-case the text and remove punctuation and extra spaces.</li><li>Drop filler words and treat synonyms alike, for example "minimum attendance percentage" and "attendance required".</li>
          <li>Fix small spelling slips against the FAQ vocabulary.</li><li>Score every approved question and its alternative phrasings, weighting rare words more.</li>
          <li>Answer only above a ${Math.round(MATCH_THRESHOLD * 100)}% confidence threshold. One shared keyword is not enough.</li></ul></div></section>
        <section class="card"><h2>Demo notes</h2><div class="prose"><ul>
          <li>Login is a demo (<code class="k">${DEMO_USER}</code> / <code class="k">${DEMO_PASS}</code>) and is not production-grade security.</li>
          <li>Recent questions, unanswered questions, feedback, notices and theme are saved in this browser only (localStorage).</li>
          <li>All FAQs and notices are sample content. Replace entries marked <span class="ph">Sample</span> or <span class="ph">Placeholder</span> with verified college information.</li>
          <li>Tamil is not available yet; the interface says so instead of showing unverified translations.</li></ul></div></section>
      </div>
      <section class="card" style="margin-top:20px"><h2>Updating the approved FAQs</h2><div class="prose"><p>Edit <code class="k">src/faq-data.js</code>: add an object to <code class="k">FAQS</code> with a question, a few alternative phrasings, keywords and the verified answer, then rebuild with <code class="k">python3 build.py</code>. In the running app, an administrator can also turn an unanswered question into an approved FAQ from the Unanswered Questions page.</p></div></section>`;
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act], #pw-toggle, #fill-demo, #theme-sw, #theme-sw-login, #menu-btn, #clear-chat');
    if (!t) return;
    const id = t.id, act = t.dataset.act, arg = t.dataset.id;
    if (id === 'pw-toggle') { const p = $('#p'), show = p.type === 'password'; p.type = show ? 'text' : 'password'; t.setAttribute('aria-pressed', String(show)); t.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); t.innerHTML = ic(show ? 'eyeoff' : 'eye'); return; }
    if (id === 'fill-demo') { $('#u').value = DEMO_USER; $('#p').value = DEMO_PASS; $('#login-alert').innerHTML = ''; ['u', 'p'].forEach(k => { $('#' + k + '-err').textContent = ''; $('#' + k + '-wrap').classList.remove('bad'); }); $('#login-btn').focus(); return; }
    if (id === 'theme-sw' || id === 'theme-sw-login') { S.theme = isDark() ? 'light' : 'dark'; save('theme'); applyTheme(); if (S.user) updateChrome(); else { const st = !!$('#u') ; const uv = st ? $('#u').value : '', pv = st ? $('#p').value : ''; renderLogin(); if ($('#u')) { $('#u').value = uv; $('#p').value = pv; } } return; }
    if (id === 'menu-btn') { const open = document.body.classList.toggle('nav-open'); t.setAttribute('aria-expanded', String(open)); return; }
    if (id === 'clear-chat') return clearChat();
    switch (act) {
      case 'go': return go(arg);
      case 'close-nav': document.body.classList.remove('nav-open'); return;
      case 'logout': return logout();
      case 'cat-open': S.faqCat = arg; S.faqQuery = ''; return go('faq-categories');
      case 'faq-cat': S.faqCat = arg; $('#faq-chips').innerHTML = faqChips(); $('#faq-results').innerHTML = faqListHTML(); return;
      case 'ask': return ask(t.dataset.text);
      case 'prefill': { const f = getFaq(arg); S.prefill = f ? f.q : ''; return go('chat'); }
      case 'reopen': { const r = S.recent.find(x => x.id === arg); if (r) ask(r.q, { noLog: true }); return; }
      case 'home-reveal': S.homeFodShown = true; return renderView();
      case 'daily-reveal': S.dailyShown = true; return renderView();
      case 'fb': {
        const m = S.chat.find(x => x.id === arg); if (!m || m.fb) return;
        m.fb = t.dataset.v; recordFeedback(m.faqId, m.fb);
        const el = $(`[data-mid="${arg}"]`); if (el) { el.outerHTML = msgHTML(m, false); }
        toast(m.fb === 'up' ? 'Thanks for your feedback!' : 'Thanks. We will review this answer.'); return;
      }
      case 'fb-daily': {
        if (S.dailyFb[arg]) return;
        S.dailyFb[arg] = t.dataset.v; save('dailyFb'); recordFeedback(t.dataset.faq, t.dataset.v);
        renderView(); toast(t.dataset.v === 'up' ? 'Thanks for your feedback!' : 'Thanks. We will review this answer.'); return;
      }
      case 'clear-recent': return confirmDialog({ title: 'Clear question history?', body: 'Your recent questions will be removed from this browser.', ok: 'Clear history', danger: true }).then(y => { if (y) { S.recent = []; save('recent'); renderView(); toast('History cleared.'); } });
      case 'notice-cat': S.noticeCat = arg; return renderView();
      case 'notice-more': S.openNotice[arg] = !S.openNotice[arg]; return renderView();
      case 'admin-toggle': S.admin = !S.admin; return renderView();
      case 'notice-add': return noticeForm(null);
      case 'notice-edit': return noticeForm(S.notices.find(n => n.id === arg));
      case 'notice-del': return confirmDialog({ title: 'Remove this notice?', body: 'The notice will be deleted from this browser.', ok: 'Remove', danger: true }).then(y => { if (y) { S.notices = S.notices.filter(n => n.id !== arg); save('notices'); renderView(); toast('Notice removed.'); } });
      case 'un-filter': S.unFilter = arg; return renderView();
      case 'un-toggle': { const u = S.unanswered.find(x => x.id === arg); if (u) { u.status = u.status === 'pending' ? 'reviewed' : 'pending'; save('unanswered'); renderView(); toast(u.status === 'reviewed' ? 'Marked as reviewed.' : 'Moved back to pending.'); } return; }
      case 'un-del': return confirmDialog({ title: 'Remove this entry?', body: 'Use this for duplicate or test entries. It cannot be undone.', ok: 'Remove', danger: true }).then(y => { if (y) { S.unanswered = S.unanswered.filter(x => x.id !== arg); save('unanswered'); renderView(); toast('Entry removed.'); } });
      case 'un-add': { const u = S.unanswered.find(x => x.id === arg); if (u) addFaqDialog(u); return; }
    }
  });
  document.addEventListener('submit', e => {
    if (e.target.id === 'login-form') { e.preventDefault(); submitLogin(); }
    else if (e.target.id === 'chat-form') { e.preventDefault(); const i = $('#chat-input'); const v = i.value; if (!v.trim()) { i.focus(); return; } i.value = ''; send(v); }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'lang') { S.lang = t.value; save('lang'); updateChrome(); toast(S.lang === 'ta' ? 'Tamil is not available yet. Showing English.' : 'Language set to English.', S.lang === 'ta' ? 'warn' : 'ok'); }
    else if (t.dataset && t.dataset.act === 'un-cat') { const u = S.unanswered.find(x => x.id === t.dataset.id); if (u) { u.cat = t.value; save('unanswered'); } }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { document.body.classList.remove('nav-open'); const m = $('#menu-btn'); if (m) { m.setAttribute('aria-expanded', 'false'); m.focus(); } } });
  window.addEventListener('hashchange', () => { if (S.user) renderView(); });

  /* ---------- boot ---------- */
  applyTheme();
  if (S.user) renderView(); else renderLogin();

  // Small hook so the automated tests can drive the app.
  window.__grt = { S, matcher: () => matcher };
})();
