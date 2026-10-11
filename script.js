// ============================================================
// CẤU HÌNH BẢO TRÌ
// ============================================================
const MAINTENANCE_MODE = {
    client: false,
    nx: true,
    pc: false,
    px: false,
    pv: true,
    D32: true,
    solara: false,
    xeno: false,
    umi: false,
    volcano: false
};

// ============================================================
// CẤU HÌNH DOWNLOAD
// ============================================================
const DOWNLOADS = {
    client:  { url: 'https://vuotnhanh.com/j1tZ', filename: 'Delta-v2.735.1138.apk' },
    D32:     { url: 'https://vuotnhanh.com/oJou', filename: 'Delta-32bit-v2.736.1408.apk' },
    nx:      { url: 'https://vuotnhanh.com/TxPF', filename: 'Roblox-Lite-NX-v3.0.1.apk' },
    pc:      { url: 'https://vuotnhanh.com/CEGE', filename: 'Executor-PC-Real-v1.7.0.zip' },
    px:      { url: 'https://vuotnhanh.com/fXSZ', filename: 'Executor-PC-Medium-v1.5.0.zip' },
    pv:      { url: 'https://vuotnhanh.com/zij1', filename: 'Executor-PC-Velocity-v1.6.0.zip' },
    solara:  {
        url: 'https://4d38a1ec.solaraweb-alj.pages.dev/download/static/files/Bootstrapper.exe',
        filename: 'Solara-Bootstrapper.exe'
    },
    xeno:    { url: 'https://xeno.now/', filename: 'Xeno-Executor.exe' },
    umi:     { url: 'https://vuotnhanh.com/OSj9', filename: 'Umi-Executor.exe' },
    volcano: { url: 'https://vuotnhanh.com/YANb', filename: 'Volcano-Executor.exe' }
};

// ============================================================
// CẤU HÌNH THÔNG BÁO
// ============================================================
const NOTIFICATION_CONFIG = {
    enabled: true,
    hideDurationMs: 2 * 60 * 60 * 1000,
    storageKey: 'matchat_notif_hide_until',
    delayAfterLoader: 300
};

// ============================================================
// CẤU HÌNH THEME
// ============================================================
const THEME_CONFIG = {
    storageKey: 'theme',
    labels: { dark: 'Dark', light: 'Light' }
};

// ============================================================
// CẤU HÌNH VERIFY
// ============================================================
const VERIFY_CONFIG = {
    storageKey: 'matchat_verified_until',
    verifyPage: 'verify.html',
    webUrl: 'https://kenhmatchat-executor.vercel.app/'
};

// ============================================================
// UTILITIES
// ============================================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const SEEN_KEY = 'executor_seen';
const CARD_SELECTOR = '.card[data-executor]';

// Motion environment — read once, kept live.
const MOTION = {
    reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    fine: window.matchMedia('(hover: hover) and (pointer: fine)').matches
};
(function watchMotionPrefs() {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => {
        MOTION.reduce = e.matches;
        document.documentElement.classList.toggle('motion', !e.matches);
    };
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    // Don't animate (or burn battery) while the tab is hidden
    document.addEventListener('visibilitychange', () => {
        document.documentElement.classList.toggle('is-hidden', document.hidden);
    });
})();

// Run `fn` for the first animation of `name` finishing on `el`, then stop listening.
function onAnimationDone(el, name, fn) {
    const handler = (e) => {
        if (e.target !== el || e.animationName !== name) return;
        el.removeEventListener('animationend', handler);
        fn();
    };
    el.addEventListener('animationend', handler);
}

// Give a set of cards a staggered entrance; the delay is cleared afterwards so a
// later replay (search / tab switch) isn't slowed down by a stale value.
function staggerCards(cards, step = 70, maxSteps = 6) {
    cards.forEach((card, i) => {
        card.style.setProperty('--delay', Math.min(i, maxSteps) * step + 'ms');
        onAnimationDone(card, 'cardIn', () => card.style.removeProperty('--delay'));
    });
}

// ============================================================
// VERIFY CHECK — Chặn nếu chưa verify
// ============================================================
(function checkVerify() {
    const verifiedUntil = parseInt(localStorage.getItem(VERIFY_CONFIG.storageKey) || '0', 10);
    if (Date.now() >= verifiedUntil) {
        window.location.replace(VERIFY_CONFIG.verifyPage);
        return;
    }
})();

// ============================================================
// BOOTSTRAP
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOMContentLoaded');
    clearTimeout(window.__motionGuard);
    document.documentElement.classList.toggle('motion', !MOTION.reduce);

    initTheme();
    initReveal();          // must register before the loader can finish
    initLoader();
    initTabs();
    initSearch();
    initDownloadButtons();
    initNotification();
    initGuide();
    initBackToTop();
    initScrollUI();
    initTimeAgo();
    initDiscordFloat();
    initCookie();
    initInfoModal();
    initCardFx();
});

// ============================================================
// 1️⃣ THEME
// ============================================================
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const label = document.querySelector('[data-role="theme-label"]');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateThemeLabel(currentTheme, label);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
        if (!localStorage.getItem(THEME_CONFIG.storageKey)) {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
            updateThemeLabel(newTheme, label);
        }
    };
    if (mql.addEventListener) mql.addEventListener('change', handleSystemChange);
    else if (mql.addListener) mql.addListener(handleSystemChange);
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(THEME_CONFIG.storageKey, next); } catch (e) {}
        swapTheme(next, toggle, () => {
            applyTheme(next);
            updateThemeLabel(next, label);
        });
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            toggle.click();
        }
    });
}

// One-shot circular reveal from the toggle (View Transitions API).
// Falls back to a brief, temporary colour fade — never a permanent transition on every element.
function swapTheme(next, originEl, commit) {
    const root = document.documentElement;
    if (MOTION.reduce) { commit(); return; }

    if (typeof document.startViewTransition !== 'function') {
        root.classList.add('theme-fade');
        commit();
        setTimeout(() => root.classList.remove('theme-fade'), 320);
        return;
    }

    const r = originEl.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(commit);
    transition.ready.then(() => {
        root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 560, easing: 'cubic-bezier(.22, 1, .36, 1)', pseudoElement: '::view-transition-new(root)' }
        );
    }).catch(() => {});
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#fbfbfd');
    }
}

function updateThemeLabel(theme, labelEl) {
    if (labelEl) labelEl.textContent = THEME_CONFIG.labels[theme] || 'Dark';
}

// ============================================================
// 2️⃣ LOADER
// ============================================================
function initLoader() {
    const loader = $('#loader');
    const pctEl = $('#percentage');
    const bar = $('#loader-bar');

    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}

    // Returning visitor / reduced motion / missing markup: no splash at all.
    if (!loader || !pctEl || !bar || seen || MOTION.reduce) {
        if (loader) loader.remove();
        onLoaderDone();
        return;
    }

    // Progress is real: it waits for window.load + web fonts (min 700ms so it never
    // flashes, hard cap 3.2s so it can never hang). Driven by rAF, painted with scaleX.
    const MIN = 700;
    const MAX = 3200;
    const t0 = performance.now();
    let ready = false;
    let cur = 0;
    let last = t0;
    let shown = -1;
    let done = false;

    const loaded = document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((res) => window.addEventListener('load', res, { once: true }));
    Promise.all([loaded, document.fonts ? document.fonts.ready : null]).then(() => { ready = true; });

    const finish = () => {
        if (done) return;
        done = true;
        bar.style.transform = 'scaleX(1)';
        pctEl.textContent = '100';
        loader.classList.add('is-complete');
        setTimeout(() => {
            loader.classList.add('hidden');
            try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
            onLoaderDone();
            setTimeout(() => loader.remove(), 520);   // free the layer
        }, 240);
    };

    const tick = (now) => {
        if (done) return;
        const t = now - t0;
        const dt = now - last;
        last = now;

        const target = ready && t >= MIN
            ? 1
            : 0.9 * (1 - Math.pow(1 - Math.min(1, t / 1600), 3));
        cur += (target - cur) * (1 - Math.exp(-dt / 110));   // frame-rate independent easing

        bar.style.transform = `scaleX(${cur.toFixed(4)})`;
        const pct = Math.min(99, Math.floor(cur * 100));
        if (pct !== shown) { shown = pct; pctEl.textContent = pct; }

        if ((ready && t >= MIN && cur > 0.985) || t > MAX) { finish(); return; }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(finish, MAX + 600);   // safety net if rAF is throttled
}

function onLoaderDone() {
    applyMaintenanceMode();
    document.documentElement.classList.add('is-ready');   // starts the .enter choreography
    window.dispatchEvent(new CustomEvent('loader:done'));
}

// ============================================================
// 3️⃣ TABS (với indicator trượt #14 + slide #13)
// ============================================================
function initTabs() {
    const bar = $('.tab-bar');
    if (!bar) return;
    const btns = $$('.tab-btn', bar);
    const ind = $('#tabIndicator');
    const panels = { mobile: $('#tab-mobile'), pc: $('#tab-pc') };

    // The pill is a 1px square: position/size are CSS variables, motion is transform only.
    const place = (btn, animate) => {
        if (!ind || !btn) return;
        if (!animate) ind.classList.add('no-anim');
        ind.style.setProperty('--x', btn.offsetLeft + 'px');
        ind.style.setProperty('--y', btn.offsetTop + 'px');
        ind.style.setProperty('--w', btn.offsetWidth);
        ind.style.setProperty('--h', btn.offsetHeight);
        ind.classList.add('is-placed');
        if (!animate) {
            void ind.offsetWidth;            // commit without transition
            ind.classList.remove('no-anim');
        }
    };
    const active = () => $('.tab-btn.active', bar);

    const select = (btn, focus) => {
        const target = btn.dataset.tab;
        if (!target || !panels[target] || btn === active()) return;

        btns.forEach((b) => {
            const on = b === btn;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
            b.tabIndex = on ? 0 : -1;
        });
        place(btn, true);
        if (focus) btn.focus();

        // Cards already revealed replay a short staggered entrance when their panel
        // becomes visible (display:none -> block restarts the CSS animation).
        const incoming = panels[target];
        if (!MOTION.reduce) {
            staggerCards($$(CARD_SELECTOR + '.is-in:not(.hidden)', incoming), 50, 5);
        }
        Object.entries(panels).forEach(([key, el]) => {
            if (el) el.classList.toggle('active', key === target);
        });
    };

    btns.forEach((btn, i) => {
        btn.tabIndex = btn.classList.contains('active') ? 0 : -1;
        btn.addEventListener('click', () => select(btn, false));
        btn.addEventListener('keydown', (e) => {
            let next = null;
            if (e.key === 'ArrowRight') next = btns[(i + 1) % btns.length];
            else if (e.key === 'ArrowLeft') next = btns[(i - 1 + btns.length) % btns.length];
            else if (e.key === 'Home') next = btns[0];
            else if (e.key === 'End') next = btns[btns.length - 1];
            if (next) { e.preventDefault(); select(next, true); }
        });
    });

    // Keep the pill glued to the active tab when fonts load, the badge text changes
    // or the bar wraps — no window resize listener needed.
    const sync = () => place(active(), false);
    requestAnimationFrame(sync);
    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(sync);
        ro.observe(bar);
        btns.forEach((b) => ro.observe(b));
    } else {
        window.addEventListener('resize', sync);
    }
    if (document.fonts) document.fonts.ready.then(sync);
}

// ============================================================
// 4️⃣ SEARCH
// ============================================================
let searchDebounce = null;

function initSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');
    const emptyMsg = document.getElementById('searchEmpty');
    if (!input) return;
    const cards = document.querySelectorAll('.card[data-executor]');
    if (cards.length === 0) return;

    const performSearch = () => {
        const query = (input.value || '').toLowerCase().trim();
        let visibleCount = 0;
        cards.forEach((card) => {
            const name = (card.dataset.name || '').toLowerCase();
            const key = (card.dataset.executor || '').toLowerCase();
            const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
            const h2 = card.querySelector('h2');
            let titleText = '';
            if (h2) {
                h2.childNodes.forEach((node) => {
                    if (node.nodeType === 3) titleText += ' ' + node.textContent;
                });
                titleText = titleText.toLowerCase();
            }
            const match = !query || name.includes(query) || key.includes(query) || titleText.includes(query) || desc.includes(query);
            if (match) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        if (emptyMsg) emptyMsg.hidden = (visibleCount > 0 || !query);
        if (clearBtn) clearBtn.hidden = !query;
    };

    const handleInput = () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(performSearch, 150);
    };

    input.addEventListener('input', handleInput);
    input.addEventListener('keyup', handleInput);
    input.addEventListener('search', handleInput);
    input.addEventListener('paste', () => setTimeout(performSearch, 50));
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            input.value = ''; performSearch();
        });
    }
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { input.value = ''; performSearch(); }
    });
    performSearch();
}

// ============================================================
// 5️⃣ MAINTENANCE MODE
// ============================================================
function applyMaintenanceMode() {
    const cards = document.querySelectorAll('.card[data-executor]');
    cards.forEach((card) => {
        const key = card.dataset.executor;
        if (!key) return;
        const btn = card.querySelector('[data-role="download"]');
        const badge = card.querySelector('[data-role="badge"]');
        const status = card.querySelector('[data-role="status"]');
        const dot = card.querySelector('.dot');
        const statusText = card.querySelector('.status-text');
        if (!btn) return;
        const isMaintenance = Boolean(MAINTENANCE_MODE[key]);
        btn.classList.toggle('btn-maintenance', isMaintenance);
        btn.textContent = isMaintenance ? '⛔ Đang bảo trì' : 'Download';
        btn.disabled = isMaintenance;
        btn.setAttribute('aria-disabled', isMaintenance ? 'true' : 'false');
        if (badge) badge.style.display = isMaintenance ? 'inline-block' : 'none';
        if (dot) {
            dot.classList.toggle('online-dot', !isMaintenance);
            dot.classList.toggle('maintenance-dot', isMaintenance);
        }
        if (statusText) statusText.textContent = isMaintenance ? 'Bảo trì' : 'Online';
        if (status) status.setAttribute('aria-label', isMaintenance ? 'Trạng thái: Bảo trì' : 'Trạng thái: Online');
    });
}

// ============================================================
// 6️⃣ DOWNLOAD (với countdown animation #18 + success check #19)
// ============================================================
function initDownloadButtons() {
    const buttons = document.querySelectorAll('[data-role="download"]');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.card[data-executor]');
            const key = card?.dataset.executor;
            if (!key) return;
            handleDownload(key, btn);
        });
    });
}

async function handleDownload(key, btn) {
    if (MAINTENANCE_MODE[key] || btn.dataset.busy) return;
    const cfg = DOWNLOADS[key];
    const card = btn.closest(CARD_SELECTOR);
    const name = card?.dataset.name || 'Executor';
    if (!cfg) return;

    const originalText = btn.textContent;
    const originalDisabled = btn.disabled;
    const COUNT = 3;

    btn.dataset.busy = '1';
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.style.setProperty('--count-dur', COUNT + 's');
    btn.innerHTML = '<span class="btn-fill" aria-hidden="true"></span><span class="btn-label" aria-live="polite"></span>';
    const label = btn.querySelector('.btn-label');
    btn.classList.add('is-busy', 'is-counting');   // fill bar mirrors the countdown (scaleX)

    try {
        for (let i = COUNT; i > 0; i--) {
            label.innerHTML = `<span class="countdown-num">${i}</span>`;
            await sleep(1000);
        }
        btn.classList.remove('is-counting');

        label.textContent = 'Đang tải...';
        await sleep(300);

        const link = document.createElement('a');
        link.href = cfg.url;
        link.download = cfg.filename;
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();

        label.innerHTML = '<svg class="success-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Tải thành công!';
        btn.classList.add('is-success');
        showToast(`Đang tải ${name}...`, 'success');
        await sleep(2200);
    } catch (err) {
        label.textContent = 'Lỗi — thử lại';
        showToast(`Lỗi tải ${name}`, 'error');
        await sleep(2000);
    } finally {
        btn.textContent = originalText;
        btn.disabled = originalDisabled;
        btn.classList.remove('is-busy', 'is-counting', 'is-success');
        btn.style.removeProperty('--count-dur');
        btn.removeAttribute('aria-busy');
        delete btn.dataset.busy;
    }
}

// ============================================================
// 7️⃣ TOAST (với animation bay vào #15)
// ============================================================
const TOAST_ICONS = {
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = (TOAST_ICONS[type] || TOAST_ICONS.info) + `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
        setTimeout(() => toast.remove(), 500);
    }, duration);
}
// ============================================================
// 8️⃣ NOTIFICATION
// ============================================================
let notifController = null;

function initNotification() {
    window.addEventListener('loader:done', () => {
        setTimeout(showNotificationIfNeeded, NOTIFICATION_CONFIG.delayAfterLoader);
    });
    setTimeout(() => {
        if (!document.getElementById('notifOverlay')?.classList.contains('show')) {
            showNotificationIfNeeded();
        }
    }, 5000);
}

function showNotificationIfNeeded() {
    if (!NOTIFICATION_CONFIG.enabled) return;
    const overlay = document.getElementById('notifOverlay');
    if (!overlay) return;
    const until = parseInt(localStorage.getItem(NOTIFICATION_CONFIG.storageKey) || '0', 10);
    if (Date.now() < until) return;
    if (overlay.classList.contains('show')) return;
    if (notifController) notifController.abort();
    notifController = new AbortController();
    const { signal } = notifController;
    const close = () => {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
        if (notifController) notifController.abort();
        notifController = null;
    };
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    const closeBtn = document.getElementById('notifClose');
    if (closeBtn) closeBtn.addEventListener('click', close, { signal });
    const hideBtn = document.getElementById('notifHide');
    if (hideBtn) {
        hideBtn.addEventListener('click', () => {
            localStorage.setItem(NOTIFICATION_CONFIG.storageKey, String(Date.now() + NOTIFICATION_CONFIG.hideDurationMs));
            close();
        }, { signal });
    }
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); }, { signal });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) close();
    }, { signal });
}

// ============================================================
// 9️⃣ GUIDE
// ============================================================
let guideController = null;

function initGuide() {
    const openBtn = document.getElementById('guideOpen');
    const overlay = document.getElementById('guideOverlay');
    if (!openBtn || !overlay) return;
    openBtn.addEventListener('click', openGuide);
    const guideTabs = document.querySelectorAll('.guide-tab');
    const guideContents = {
        mobile: document.getElementById('guide-mobile'),
        pc: document.getElementById('guide-pc')
    };
    guideTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.guideTab;
            if (!target) return;
            guideTabs.forEach((t) => {
                const isActive = t === tab;
                t.classList.toggle('active', isActive);
                t.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
            Object.entries(guideContents).forEach(([key, el]) => {
                if (el) el.classList.toggle('active', key === target);
            });
        });
    });
    const faqToggle = document.getElementById('faqToggle');
    const faqList = document.getElementById('faqList');
    if (faqToggle && faqList) {
        faqToggle.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const isExpanded = faqToggle.getAttribute('aria-expanded') === 'true';
            const willExpand = !isExpanded;
            faqToggle.setAttribute('aria-expanded', String(willExpand));
            if (willExpand) faqList.removeAttribute('hidden');
            else faqList.setAttribute('hidden', '');
        });
    }
    const closeBtn = document.getElementById('guideClose');
    if (closeBtn) closeBtn.addEventListener('click', closeGuide);
    const okBtn = document.getElementById('guideOk');
    if (okBtn) okBtn.addEventListener('click', closeGuide);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeGuide(); });
}

function openGuide() {
    const overlay = document.getElementById('guideOverlay');
    if (!overlay || overlay.classList.contains('show')) return;
    if (guideController) guideController.abort();
    guideController = new AbortController();
    const { signal } = guideController;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) closeGuide();
    }, { signal });
}

function closeGuide() {
    const overlay = document.getElementById('guideOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    if (guideController) guideController.abort();
    guideController = null;
}

// ============================================================
// 🔟 BACK TO TOP
// ============================================================
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================================
// 1️⃣1️⃣ READING PROGRESS
// ============================================================
function initScrollUI() {
    const fill = $('#readingProgressFill');
    const backTop = $('#backToTop');
    // Browsers with scroll-driven animations draw the progress bar in CSS, with zero JS.
    const nativeProgress = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'));
    let ticking = false;
    let wasShown = null;

    const update = () => {
        ticking = false;
        const y = window.scrollY || document.documentElement.scrollTop;
        if (!nativeProgress && fill) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            fill.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max).toFixed(4) : 0})`;
        }
        const show = y > 400;
        if (backTop && show !== wasShown) {   // touch the DOM only when the state flips
            wasShown = show;
            backTop.classList.toggle('show', show);
        }
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
}

// ============================================================
// 1️⃣2️⃣ TOP PROGRESS BAR (#12)
// ============================================================

// ============================================================
// 📅 TIME AGO
// ============================================================
function initTimeAgo() {
    const elements = document.querySelectorAll('[data-role="updated"]');
    if (elements.length === 0) return;
    const updateElement = (el) => {
        const card = el.closest('.card[data-executor]');
        if (!card) return;
        const dateStr = card.dataset.updated;
        if (!dateStr) { el.style.display = 'none'; return; }
        const textEl = el.querySelector('.updated-text');
        if (!textEl) return;
        const result = getTimeAgo(dateStr);
        textEl.textContent = result.text;
        el.classList.remove('fresh', 'recent', 'old', 'stale');
        el.classList.add(result.class);
        el.title = result.fullDate;
    };
    elements.forEach(updateElement);
    setInterval(() => elements.forEach(updateElement), 60 * 60 * 1000);
}

function getTimeAgo(dateStr) {
    const now = new Date();
    const past = new Date(dateStr + 'T00:00:00');
    if (isNaN(past.getTime())) return { text: 'Không rõ ngày cập nhật', class: 'old', fullDate: '' };
    const fullDate = past.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const diffMs = now - past;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    let cls;
    if (diffDays > 180) cls = 'stale';
    else if (diffDays > 90) cls = 'old';
    else if (diffDays > 30) cls = 'recent';
    else cls = 'fresh';

    let text = '';
    if (diffSeconds < 60) text = 'Vừa mới cập nhật';
    else if (diffMinutes < 60) text = `${diffMinutes} phút trước`;
    else if (diffHours < 24) text = `${diffHours} giờ trước`;
    else if (diffDays === 1) text = 'Hôm qua';
    else if (diffDays < 7) text = `${diffDays} ngày trước`;
    else if (diffWeeks === 1) text = '1 tuần trước';
    else if (diffWeeks < 5) text = `${diffWeeks} tuần trước`;
    else if (diffMonths === 1) text = '1 tháng trước';
    else if (diffMonths < 12) text = `${diffMonths} tháng trước`;
    else if (diffYears === 1) text = '1 năm trước';
    else text = `${diffYears} năm trước`;

    return { text: `Cập nhật ${text.toLowerCase()}`, class: cls, fullDate: `Cập nhật lần cuối: ${fullDate}` };
}

// ============================================================
// 💬 DISCORD FLOAT
// ============================================================
function initDiscordFloat() {
    const btn = document.getElementById('discordFloat');
    if (!btn) return;
    const overlayIds = ['notifOverlay', 'guideOverlay', 'infoOverlay'];
    const updateModalState = () => {
        const anyModalOpen = overlayIds.some((id) => document.getElementById(id)?.classList.contains('show'));
        document.body.classList.toggle('modal-open', anyModalOpen);
    };
    overlayIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const observer = new MutationObserver(updateModalState);
        observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
}

// ============================================================
// 🍪 COOKIE
// ============================================================
function initCookie() {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const declineBtn = document.getElementById('cookieDecline');
    if (!banner) return;
    const KEY = 'matchat_cookie_accepted';
    const saved = localStorage.getItem(KEY);
    if (!saved) {
        setTimeout(() => { banner.hidden = false; }, 1500);
    }
    const hideBanner = (value) => {
        localStorage.setItem(KEY, value);
        banner.classList.add('hide');
        setTimeout(() => {
            banner.hidden = true;
            banner.classList.remove('hide');
        }, 350);
    };
    if (acceptBtn) acceptBtn.addEventListener('click', () => {
        hideBanner('1');
        showToast('Đã chấp nhận cookies', 'success');
    });
    if (declineBtn) declineBtn.addEventListener('click', () => {
        hideBanner('0');
        showToast('Đã từ chối cookies', 'info');
    });
}

// ============================================================
// 📄 INFO MODAL
// ============================================================
const INFO_CONTENT = {
    about: {
        eyebrow: 'Giới thiệu',
        title: 'About Matchat67',
        body: `
            <h4>⚡ Matchat67 Executor</h4>
            <p>Website tổng hợp Executor &amp; Client Roblox miễn phí, cập nhật liên tục với các tool hot nhất 2026: Delta, Solara, Xeno, Umi, Volcano và nhiều tool khác.</p>
            <h4>🎯 Sứ mệnh</h4>
            <ul>
                <li>Cung cấp executor miễn phí, chất lượng cao</li>
                <li>Cập nhật liên tục khi Roblox có bản mới</li>
                <li>Xây dựng cộng đồng chia sẻ, hỗ trợ lẫn nhau</li>
            </ul>
            <h4>💬 Liên hệ</h4>
            <p>Tham gia Discord: <a href="https://discord.gg/GrTCy2DHEX" target="_blank">discord.gg/GrTCy2DHEX</a></p>
        `
    },
    terms: {
        eyebrow: 'Điều khoản',
        title: 'Terms of Service',
        body: `
            <h4>📜 Điều khoản sử dụng</h4>
            <p>Bằng việc truy cập website, bạn đồng ý với các điều khoản sau:</p>
            <h4>1. Mục đích sử dụng</h4>
            <p>Executor trên web được cung cấp cho mục đích học tập, nghiên cứu và giải trí cá nhân.</p>
            <h4>2. Trách nhiệm người dùng</h4>
            <ul>
                <li>Không sử dụng executor cho mục đích gây hại</li>
                <li>Không bán lại, không phân phối lại với mục đích thương mại</li>
                <li>Chấp nhận rủi ro có thể bị ban tài khoản Roblox</li>
            </ul>
            <h4>3. Miễn trừ trách nhiệm</h4>
            <p>Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng executor trên web.</p>
        `
    },
    privacy: {
        eyebrow: 'Quyền riêng tư',
        title: 'Privacy Policy',
        body: `
            <h4>🔒 Chính sách bảo mật</h4>
            <p>Website tôn trọng quyền riêng tư của bạn. Chúng tôi thu thập tối thiểu dữ liệu:</p>
            <h4>1. Dữ liệu thu thập</h4>
            <ul>
                <li><strong>Cookies / localStorage:</strong> Ghi nhớ theme, ngôn ngữ, lựa chọn cookie</li>
                <li><strong>Không thu thập:</strong> Email, mật khẩu, thông tin cá nhân</li>
            </ul>
            <h4>2. Cách sử dụng</h4>
            <p>Chỉ dùng để cải thiện trải nghiệm. Không bán, không chia sẻ cho bên thứ ba.</p>
            <h4>3. Quyền của bạn</h4>
            <p>Bạn có thể xoá cookies/localStorage bất kỳ lúc nào bằng cách xoá dữ liệu trình duyệt.</p>
        `
    },
    legal: {
        eyebrow: 'Pháp lý',
        title: 'Legal Disclaimer',
        body: `
            <h4>⚖️ Tuyên bố miễn trừ</h4>
            <p><strong>Website này KHÔNG liên kết với Roblox Corporation.</strong></p>
            <p>Roblox là thương hiệu đã đăng ký của Roblox Corporation. Mọi thương hiệu, logo đều thuộc về chủ sở hữu gốc.</p>
            <h4>1. Sử dụng executor</h4>
            <p>Việc sử dụng executor có thể vi phạm <a href="https://en.help.roblox.com/hc/en-us/articles/115004647846-Roblox-Terms-of-Use" target="_blank">Điều khoản của Roblox</a>. Bạn tự chịu trách nhiệm.</p>
            <h4>2. Nội dung bên thứ ba</h4>
            <p>Executor được tổng hợp từ nguồn công khai. Chúng tôi không chịu trách nhiệm về nội dung bên thứ ba.</p>
            <h4>3. DMCA</h4>
            <p>Nếu bạn là tác giả và muốn gỡ executor, liên hệ Discord để xử lý trong 48h.</p>
        `
    },
    contact: {
        eyebrow: 'Liên hệ',
        title: 'Contact Us',
        body: `
            <h4>📬 Liên hệ với chúng tôi</h4>
            <p>Có câu hỏi, báo lỗi, hoặc đóng góp? Liên hệ qua:</p>
            <h4>💬 Discord (nhanh nhất)</h4>
            <p>👉 <a href="https://discord.gg/GrTCy2DHEX" target="_blank"><strong>discord.gg/GrTCy2DHEX</strong></a></p>
            <h4>📧 Email</h4>
            <p><a href="mailto:kenhmatchat@gmail.com">kenhmatchat@gmail.com</a></p>
            <h4>⏱️ Thời gian phản hồi</h4>
            <ul>
                <li>Discord: trong 1-2 giờ</li>
                <li>Email: trong 24-48 giờ</li>
            </ul>
        `
    }
};

function openInfoModal(key) {
    const info = INFO_CONTENT[key];
    if (!info) return;
    const overlay = document.getElementById('infoOverlay');
    if (!overlay) return;
    const eyebrowEl = document.getElementById('infoEyebrow');
    const titleEl = document.getElementById('infoTitle');
    const bodyEl = document.getElementById('infoBody');
    if (eyebrowEl) eyebrowEl.textContent = info.eyebrow;
    if (titleEl) titleEl.textContent = info.title;
    if (bodyEl) bodyEl.innerHTML = info.body;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeInfoModal() {
    const overlay = document.getElementById('infoOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function initInfoModal() {
    const overlay = document.getElementById('infoOverlay');
    if (!overlay) return;
    document.querySelectorAll('[data-info]').forEach((btn) => {
        btn.addEventListener('click', () => openInfoModal(btn.dataset.info));
    });
    const closeBtn = document.getElementById('infoClose');
    if (closeBtn) closeBtn.addEventListener('click', closeInfoModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeInfoModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) closeInfoModal();
    });
}
// ============================================================
// 🎬 MOTION — card reveal + pointer FX
// ============================================================

// Reveal: one IntersectionObserver, staggered by DOM order, starts after the loader.
function initReveal() {
    const cards = $$(CARD_SELECTOR);
    const showAll = () => cards.forEach((c) => c.classList.add('is-in'));

    if (MOTION.reduce || !('IntersectionObserver' in window)) {
        showAll();
        return;
    }

    let io = null;
    const start = () => {
        io = new IntersectionObserver((entries) => {
            const hits = entries
                .filter((en) => en.isIntersecting)
                .map((en) => en.target)
                .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
            if (!hits.length) return;
            staggerCards(hits);
            hits.forEach((c) => { c.classList.add('is-in'); io.unobserve(c); });
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
        cards.forEach((c) => io.observe(c));
    };

    window.addEventListener('loader:done', start, { once: true });
}

// Pointer FX: spotlight + 3D tilt. One delegated listener, rAF-coalesced,
// writes CSS variables only (the browser composites the rest).
function initCardFx() {
    if (!MOTION.fine || MOTION.reduce) return;

    const MAX_TILT = 4;   // degrees
    let current = null;
    let evt = null;
    let raf = 0;

    const paint = () => {
        raf = 0;
        if (!current || !evt) return;
        const r = current.getBoundingClientRect();
        const x = evt.clientX - r.left;
        const y = evt.clientY - r.top;
        current.style.setProperty('--mx', x.toFixed(1) + 'px');
        current.style.setProperty('--my', y.toFixed(1) + 'px');
        current.style.setProperty('--rx', ((0.5 - y / r.height) * 2 * MAX_TILT).toFixed(2) + 'deg');
        current.style.setProperty('--ry', ((x / r.width - 0.5) * 2 * MAX_TILT).toFixed(2) + 'deg');
    };

    const release = (card) => {
        if (!card) return;
        card.classList.remove('is-tilting');
        card.style.removeProperty('--rx');   // glow position is kept so it fades out in place
        card.style.removeProperty('--ry');
    };

    document.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const card = e.target instanceof Element ? e.target.closest(CARD_SELECTOR) : null;
        if (card !== current) {
            release(current);
            current = card;
            if (current) current.classList.add('is-tilting');
        }
        if (!current) return;
        evt = e;
        if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });

    document.documentElement.addEventListener('pointerleave', () => {
        release(current);
        current = null;
    });
}

// ============================================================
// GLOBAL ERROR
// ============================================================
window.addEventListener('error', (e) => {
    console.error('[Global Error]', e.error);
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
    document.documentElement.classList.remove('motion');   // drop all hidden start-states
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('[Unhandled Promise]', e.reason);
});
