// ============================================================
// CẤU HÌNH BẢO TRÌ
// ============================================================
const MAINTENANCE_MODE = {
    client: false,
    nx: true,
    pc: false,
    px: false,
    pv: true,
    D32: false,
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
    D32:     { url: 'https://link4sub.com/PyhQ8EUIjP', filename: 'Delta-32bit-v2.736.1408.apk' },
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
// Safe storage wrappers: app still works when browser storage is blocked.
function safeStorageGet(key) { try { return window.localStorage.getItem(key); } catch (_) { return null; } }
function safeStorageSet(key, value) { try { window.localStorage.setItem(key, value); } catch (_) {} }
function safeStorageRemove(key) { try { window.localStorage.removeItem(key); } catch (_) {} }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// VERIFY CHECK — Chặn nếu chưa verify
// ============================================================
(function checkVerify() {
    const verifiedUntil = parseInt(safeStorageGet(VERIFY_CONFIG.storageKey) || '0', 10);
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
    initTheme();
    initLoader();
    initTabs();
    initSearch();
    initDownloadButtons();
    initNotification();
    initGuide();
    initBackToTop();
    initReadingProgress();
    initTimeAgo();
    initDiscordFloat();
    initCookie();
    initInfoModal();
    init3DTilt();          // ← ANIMATION #7
    initRippleEffect();    // ← ANIMATION #3
    initCardStagger();     // ← ANIMATION #8
    initSkeletonLoader();  // ← ANIMATION #10
    initTopProgress();     // ← ANIMATION #12
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
        if (!safeStorageGet(THEME_CONFIG.storageKey)) {
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
        applyTheme(next);
        safeStorageSet(THEME_CONFIG.storageKey, next);
        updateThemeLabel(next, label);
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            toggle.click();
        }
    });
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
    const loader = document.getElementById('loader');
    const percentage = document.getElementById('percentage');
    const loaderBar = document.getElementById('loader-bar');
    if (!loader || !percentage || !loaderBar) {
        if (loader) loader.classList.add('hidden');
        onLoaderDone();
        return;
    }

    const DURATION = 1500;
    const STEP_INTERVAL = 50;
    const totalSteps = DURATION / STEP_INTERVAL;
    let step = 0;
    let finished = false;

    const interval = setInterval(() => {
        step++;
        const t = Math.min(1, step / totalSteps);
        const progress = Math.round(100 * (1 - Math.pow(1 - t, 3)));
        percentage.textContent = progress + '%';
        loaderBar.style.width = progress + '%';
        if (progress >= 100 && !finished) {
            finished = true;
            clearInterval(interval);
            loaderBar.style.background = 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)';
            setTimeout(() => {
                loader.classList.add('hidden');
                onLoaderDone();
            }, 400);
        }
    }, STEP_INTERVAL);

    setTimeout(() => {
        if (!finished) {
            finished = true;
            clearInterval(interval);
            percentage.textContent = '100%';
            loaderBar.style.width = '100%';
            loader.classList.add('hidden');
            onLoaderDone();
        }
    }, 4000);
}

function onLoaderDone() {
    applyMaintenanceMode();
    window.dispatchEvent(new CustomEvent('loader:done'));
}

// ============================================================
// 3️⃣ TABS (với indicator trượt #14 + slide #13)
// ============================================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = {
        mobile: document.getElementById('tab-mobile'),
        pc: document.getElementById('tab-pc')
    };
    const indicator = document.getElementById('tabIndicator');

    function moveIndicator(btn) {
        if (!indicator || !btn) return;
        const barRect = btn.parentElement.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        indicator.style.left = (btnRect.left - barRect.left) + 'px';
        indicator.style.width = btnRect.width + 'px';
    }

    requestAnimationFrame(() => {
        const active = document.querySelector('.tab-btn.active');
        moveIndicator(active);
    });

    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            if (!targetTab || !tabContents[targetTab]) return;
            tabBtns.forEach((b) => {
                const isActive = b === btn;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
            moveIndicator(btn);
            Object.entries(tabContents).forEach(([key, el]) => {
                if (el) {
                    el.classList.toggle('active', key === targetTab);
                    if (key === targetTab) {
                        // Animation slide khi tab hiện
                        el.style.animation = 'none';
                        void el.offsetWidth;
                        el.style.animation = 'tabSlideIn .4s cubic-bezier(.2, .8, .2, 1)';
                    }
                }
            });
        });
    });

    window.addEventListener('resize', () => {
        const active = document.querySelector('.tab-btn.active');
        moveIndicator(active);
    });
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
    if (MAINTENANCE_MODE[key]) return;
    const cfg = DOWNLOADS[key];
    const card = btn.closest('.card[data-executor]');
    const name = card?.dataset.name || 'Executor';
    if (!cfg) return;

    // #17: Nút lún xuống khi click
    btn.classList.add('btn-pressing');
    setTimeout(() => btn.classList.remove('btn-pressing'), 200);

    const originalText = btn.textContent;
    const originalDisabled = btn.disabled;
    btn.disabled = true;

    // #18: Countdown với animation scale
    for (let i = 3; i > 0; i--) {
        btn.innerHTML = `<span class="countdown-num">${i}</span>`;
        btn.classList.add('countdown-active');
        await sleep(1000);
        btn.classList.remove('countdown-active');
    }

    try {
        btn.textContent = 'Đang tải...';
        await sleep(300);

        const link = document.createElement('a');
        link.href = cfg.url;
        link.download = cfg.filename;
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();

        // #19: Success check với animation vẽ dần
        btn.innerHTML = '<svg class="success-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tải thành công!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
        btn.style.color = '#000';
        btn.style.borderColor = 'transparent';
        btn.classList.add('success-anim');

        showToast(`Đang tải ${name}...`, 'success');
        await sleep(2200);
    } catch (err) {
        btn.textContent = 'Lỗi — thử lại';
        showToast(`Lỗi tải ${name}`, 'error');
        await sleep(2000);
    } finally {
        btn.textContent = originalText;
        btn.disabled = originalDisabled;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
        btn.classList.remove('success-anim');
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
    const until = parseInt(safeStorageGet(NOTIFICATION_CONFIG.storageKey) || '0', 10);
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
            safeStorageSet(NOTIFICATION_CONFIG.storageKey, String(Date.now() + NOTIFICATION_CONFIG.hideDurationMs));
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
function initReadingProgress() {
    const progressBar = document.getElementById('readingProgressFill');
    const backTop = document.getElementById('backToTop');
    let ticking = false;
    const update = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = Math.min(100, percent) + '%';
        if (backTop) backTop.classList.toggle('show', scrollTop > 400);
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
    update();
}

// ============================================================
// 1️⃣2️⃣ TOP PROGRESS BAR (#12)
// ============================================================
function initTopProgress() {
    const fill = document.getElementById('topProgressFill');
    if (!fill) return;

    // Load animation: 0 → 100% trong 1.5s
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            fill.style.width = '100%';
            clearInterval(interval);
            setTimeout(() => {
                fill.style.opacity = '0';
                setTimeout(() => {
                    fill.style.width = '0%';
                    fill.style.opacity = '1';
                }, 300);
            }, 400);
        } else {
            fill.style.width = progress + '%';
        }
    }, 100);
}

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
    const saved = safeStorageGet(KEY);
    if (!saved) {
        setTimeout(() => { banner.hidden = false; }, 1500);
    }
    const hideBanner = (value) => {
        safeStorageSet(KEY, value);
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
// 🎬 ANIMATION FUNCTIONS
// ============================================================

// #7: 3D Tilt cho card
function init3DTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(max-width: 900px)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    document.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.card[data-executor]');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rX = ((y - cy) / cy) * -4;
        const rY = ((x - cx) / cx) * 4;

        card.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-6px)`;
        card.classList.add('tilting');
    });

    document.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.card[data-executor]');
        if (!card) return;
        if (card.contains(e.relatedTarget)) return;

        card.style.transform = '';
        card.classList.remove('tilting');
    });
}

// #3: Ripple effect khi click card
function initRippleEffect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card[data-executor]');
        if (!card) return;
        // Không ripple khi click button
        if (e.target.closest('button')) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';

        card.appendChild(ripple);

        setTimeout(() => ripple.remove(), 700);
    });
}

// #8: Card xuất hiện từng cái (stagger)
function initCardStagger() {
    const cards = document.querySelectorAll('.card[data-executor]');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity .5s cubic-bezier(.2, .8, .2, 1), transform .5s cubic-bezier(.2, .8, .2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + index * 80);
    });
}

// #10: Skeleton loading (khi search/tab đổi)
function initSkeletonLoader() {
    // Không cần thiết vì card đã có sẵn trong HTML
    // Nhưng có thể dùng cho tương lai khi load từ API
    window.showSkeleton = function(container, count = 4) {
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton-shimmer"></div>
                <div class="skeleton-line title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line btn"></div>
            `;
            container.appendChild(skeleton);
        }
    };
}

// ============================================================
// GLOBAL ERROR
// ============================================================
window.addEventListener('error', (e) => {
    console.error('[Global Error]', e.error);
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('[Unhandled Promise]', e.reason);
});
