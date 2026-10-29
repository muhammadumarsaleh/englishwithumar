/* =========================================================
   EduSpark Studio Pro — app.js
   Utility global, Toast Notification, Cart State (localStorage)
   ========================================================= */

(function (window, document) {
  'use strict';

  /* =========================================================
     1. KONSTANTA & STORAGE KEY
     ========================================================= */
  const STORAGE = {
    CART: 'eduspark_cart_v1',
    ADMIN_SESSION: 'eduspark_admin_session_v1',
    GAME_ACCESS: 'eduspark_game_access_v1',
    USER_PREF: 'eduspark_pref_v1'
  };

  const CONFIG = {
    CURRENCY: 'IDR',
    LOCALE: 'id-ID',
    ADMIN_PASSCODE: 'eduspark2025',
    GAME_PASSCODE: 'umar123',
    SESSION_TTL: 1000 * 60 * 60 * 8 // 8 jam
  };

  /* =========================================================
     2. UTILITY UMUM
     ========================================================= */
  const Utils = {
    formatRupiah(n) {
      if (typeof n !== 'number' || isNaN(n)) n = 0;
      return 'Rp ' + n.toLocaleString(CONFIG.LOCALE);
    },

    formatNumber(n) {
      if (typeof n !== 'number' || isNaN(n)) n = 0;
      return n.toLocaleString(CONFIG.LOCALE);
    },

    escapeHtml(str) {
      return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
    },

    /** Baca JSON dari localStorage dengan aman */
    readJSON(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
      } catch (err) {
        console.warn('[EduSpark] Gagal membaca storage:', key, err);
        return fallback;
      }
    },

    /** Tulis JSON ke localStorage dengan aman */
    writeJSON(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.warn('[EduSpark] Gagal menulis storage:', key, err);
        return false;
      }
    },

    removeKey(key) {
      try { localStorage.removeItem(key); } catch (err) { /* noop */ }
    },

    /** Debounce sederhana */
    debounce(fn, delay = 200) {
      let t;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), delay);
      };
    },

    /** Throttle sederhana */
    throttle(fn, limit = 200) {
      let waiting = false;
      return function (...args) {
        if (waiting) return;
        fn.apply(this, args);
        waiting = true;
        setTimeout(() => { waiting = false; }, limit);
      };
    },

    /** Cek apakah elemen dalam viewport (untuk reveal) */
    isInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.92 &&
        rect.bottom >= 0
      );
    },

    /** Generate ID singkat */
    uid(prefix = 'id') {
      return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    },

    /** Refresh ikon Lucide bila tersedia */
    refreshIcons() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        try { window.lucide.createIcons(); } catch (e) { /* noop */ }
      }
    }
  };

  /* =========================================================
     3. TOAST NOTIFICATION SYSTEM
     ========================================================= */
  const Toast = {
    container: null,
    queue: [],
    maxVisible: 4,

    _ensureContainer() {
      if (this.container && document.body.contains(this.container)) return this.container;

      let el = document.getElementById('eduspark-toast-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'eduspark-toast-container';
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-atomic', 'true');
        el.style.cssText = [
          'position:fixed',
          'top:88px',
          'right:16px',
          'z-index:9999',
          'display:flex',
          'flex-direction:column',
          'gap:10px',
          'pointer-events:none',
          'max-width:calc(100vw - 32px)'
        ].join(';');
        document.body.appendChild(el);
      }
      this.container = el;
      return el;
    },

    _template(type, message, title) {
      const palette = {
        success: { bg: 'linear-gradient(135deg,#059669,#10b981)', icon: 'check-circle-2' },
        error:   { bg: 'linear-gradient(135deg,#dc2626,#f43f5e)', icon: 'x-circle' },
        warning: { bg: 'linear-gradient(135deg,#d97706,#f59e0b)', icon: 'alert-triangle' },
        info:    { bg: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', icon: 'info' }
      }[type] || { bg: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', icon: 'info' };

      const el = document.createElement('div');
      el.className = 'eduspark-toast';
      el.setAttribute('role', 'status');
      el.style.cssText = [
        'pointer-events:auto',
        'display:flex',
        'align-items:flex-start',
        'gap:12px',
        'min-width:260px',
        'max-width:360px',
        'padding:14px 16px',
        'border-radius:16px',
        'background:rgba(255,255,255,.92)',
        'backdrop-filter:blur(18px) saturate(180%)',
        '-webkit-backdrop-filter:blur(18px) saturate(180%)',
        'border:1px solid rgba(255,255,255,.85)',
        'box-shadow:0 24px 60px -28px rgba(15,23,42,.45)',
        'opacity:0',
        'transform:translateX(24px) scale(.96)',
        'transition:opacity .35s cubic-bezier(.2,.8,.2,1),transform .35s cubic-bezier(.2,.8,.2,1)'
      ].join(';');

      el.innerHTML = `
        <span style="flex-shrink:0;display:grid;place-items:center;width:36px;height:36px;border-radius:12px;background:${palette.bg};color:#fff;box-shadow:0 12px 24px -12px rgba(15,23,42,.5);">
          <i data-lucide="${palette.icon}" style="width:18px;height:18px;"></i>
        </span>
        <div style="flex:1;min-width:0;">
          ${title ? `<p style="margin:0 0 2px;font-family:Outfit,sans-serif;font-weight:700;font-size:13.5px;color:#0b1020;letter-spacing:-.01em;">${Utils.escapeHtml(title)}</p>` : ''}
          <p style="margin:0;font-size:13px;line-height:1.45;color:#3b4664;">${Utils.escapeHtml(message)}</p>
        </div>
        <button type="button" aria-label="Tutup notifikasi"
          style="flex-shrink:0;display:grid;place-items:center;width:22px;height:22px;border:0;border-radius:8px;background:transparent;color:#94a3b8;cursor:pointer;transition:background .2s,color .2s;">
          <i data-lucide="x" style="width:14px;height:14px;"></i>
        </button>
      `;

      const closeBtn = el.querySelector('button');
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(148,163,184,.15)';
        closeBtn.style.color = '#334155';
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'transparent';
        closeBtn.style.color = '#94a3b8';
      });
      closeBtn.addEventListener('click', () => this._dismiss(el));

      return el;
    },

    _dismiss(el) {
      if (!el || !el.parentNode) return;
      el.style.opacity = '0';
      el.style.transform = 'translateX(24px) scale(.96)';
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    },

    show(message, type = 'info', options = {}) {
      const container = this._ensureContainer();
      const { title = '', duration = 3600 } = options;

      // Batasi jumlah toast di layar
      const existing = container.querySelectorAll('.eduspark-toast');
      if (existing.length >= this.maxVisible) {
        this._dismiss(existing[0]);
      }

      const el = this._template(type, message, title);
      container.appendChild(el);

      Utils.refreshIcons();

      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateX(0) scale(1)';
      });

      if (duration > 0) {
        const t = setTimeout(() => this._dismiss(el), duration);
        el.addEventListener('mouseenter', () => clearTimeout(t));
      }

      return el;
    },

    success(msg, opts) { return this.show(msg, 'success', opts); },
    error(msg, opts)   { return this.show(msg, 'error', opts); },
    warning(msg, opts) { return this.show(msg, 'warning', opts); },
    info(msg, opts)    { return this.show(msg, 'info', opts); }
  };

  /* =========================================================
     4. CART STATE (localStorage)
     ========================================================= */
  const Cart = {
    items: [], // [{ id, title, price, qty, img, fallback, lynk }]

    init() {
      const saved = Utils.readJSON(STORAGE.CART, []);
      this.items = Array.isArray(saved) ? saved.filter(this._isValidItem) : [];
      this.syncUI();
      this._bindGlobalEvents();
    },

    _isValidItem(item) {
      return (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.price === 'number' &&
        typeof item.qty === 'number' &&
        item.qty > 0
      );
    },

    _persist() {
      Utils.writeJSON(STORAGE.CART, this.items);
    },

    _findIndex(id) {
      return this.items.findIndex((it) => it.id === id);
    },

    add(product, qty = 1) {
      if (!product || !product.id) return false;

      const idx = this._findIndex(product.id);
      if (idx > -1) {
        this.items[idx].qty += qty;
      } else {
        this.items.push({
          id: product.id,
          title: product.title || 'Produk',
          price: Number(product.price) || 0,
          img: product.img || '',
          fallback: product.fallback || 'product',
          lynk: product.lynk || 'https://lynk.id/edusparkstudio',
          qty: Math.max(1, qty)
        });
      }

      this._persist();
      this.syncUI();
      Toast.success(`"${product.title}" ditambahkan ke keranjang`, { title: 'Berhasil' });
      return true;
    },

    updateQty(id, delta) {
      const idx = this._findIndex(id);
      if (idx === -1) return false;

      this.items[idx].qty += delta;
      if (this.items[idx].qty <= 0) {
        this.items.splice(idx, 1);
      }
      this._persist();
      this.syncUI();
      return true;
    },

    removeFromCart(id) {
      const idx = this._findIndex(id);
      if (idx === -1) return false;
      const removed = this.items.splice(idx, 1)[0];
      this._persist();
      this.syncUI();
      Toast.info(`"${removed.title}" dihapus dari keranjang`);
      return true;
    },

    clear() {
      this.items = [];
      this._persist();
      this.syncUI();
    },

    getCart() {
      return this.items.slice();
    },

    count() {
      return this.items.reduce((sum, it) => sum + it.qty, 0);
    },

    total() {
      return this.items.reduce((sum, it) => sum + it.price * it.qty, 0);
    },

    /** Update badge & tombol cart di seluruh halaman */
    syncUI() {
      const count = this.count();

      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = count;
        el.style.display = count > 0 ? 'grid' : 'none';
      });

      // Custom event untuk halaman yang ingin re-render (mis. ebooks.html)
      window.dispatchEvent(new CustomEvent('eduspark:cart-updated', {
        detail: { count, total: this.total(), items: this.getCart() }
      }));
    },

    _bindGlobalEvents() {
      // Sinkronisasi antar tab
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE.CART) {
          this.items = Utils.readJSON(STORAGE.CART, []).filter(this._isValidItem);
          this.syncUI();
        }
      });
    }
  };

  /* =========================================================
     5. SESSION HELPERS (untuk auth-guard.js)
     ========================================================= */
  const Session = {
    set(key, value, ttl = CONFIG.SESSION_TTL) {
      const payload = {
        value,
        exp: Date.now() + ttl
      };
      Utils.writeJSON(key, payload);
    },

    get(key) {
      const payload = Utils.readJSON(key, null);
      if (!payload || typeof payload !== 'object') return null;
      if (payload.exp && Date.now() > payload.exp) {
        Utils.removeKey(key);
        return null;
      }
      return payload.value;
    },

    has(key) {
      return this.get(key) != null;
    },

    clear(key) {
      Utils.removeKey(key);
    },

    /** Verifikasi passcode sederhana (client-side, bukan keamanan sejati) */
    verify(input, expected) {
      return String(input || '').trim() === String(expected || '');
    }
  };

  /* =========================================================
     6. UI INIT GLOBAL
     ========================================================= */
  const UI = {
    init() {
      this.initNavToggle();
      this.initYear();
      this.initReveal();
      this.initSmoothAnchor();
      this.refreshIcons();
    },

    initNavToggle() {
      const toggle = document.querySelector('[data-nav-toggle]');
      const menu = document.querySelector('[data-nav-menu]');
      if (!toggle || !menu) return;

      toggle.addEventListener('click', () => {
        menu.classList.toggle('hidden');
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', menu.classList.contains('hidden') ? 'menu' : 'x');
          Utils.refreshIcons();
        }
      });

      // Tutup saat klik link mobile
      menu.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => menu.classList.add('hidden'));
      });
    },

    initYear() {
      const year = new Date().getFullYear();
      document.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = year;
      });
    },

    initReveal() {
      const els = document.querySelectorAll('.reveal');
      if (!els.length) return;

      if (!('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('in'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      });

      els.forEach((el) => {
        // Jika sudah di viewport saat load, langsung tampil
        if (Utils.isInViewport(el)) {
          el.classList.add('in');
        } else {
          observer.observe(el);
        }
      });
    },

    initSmoothAnchor() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const offset = 90; // offset navbar sticky
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({ top, behavior: 'smooth' });

        // Update URL tanpa reload
        history.pushState(null, '', href);
      });
    },

    refreshIcons() {
      Utils.refreshIcons();
    }
  };

  /* =========================================================
     7. PUBLIC API — window.EduSpark
     ========================================================= */
  window.EduSpark = {
    version: '1.0.0',
    config: CONFIG,
    storage: STORAGE,

    // Utility
    formatRupiah: Utils.formatRupiah.bind(Utils),
    formatNumber: Utils.formatNumber.bind(Utils),
    escapeHtml: Utils.escapeHtml.bind(Utils),
    uid: Utils.uid.bind(Utils),
    debounce: Utils.debounce.bind(Utils),
    throttle: Utils.throttle.bind(Utils),

    // Toast
    toast: Toast.show.bind(Toast),
    Toast,

    // Cart
    addToCart: Cart.add.bind(Cart),
    updateQty: Cart.updateQty.bind(Cart),
    removeFromCart: Cart.removeFromCart.bind(Cart),
    clearCart: Cart.clear.bind(Cart),
    getCart: Cart.getCart.bind(Cart),
    cartCount: Cart.count.bind(Cart),
    cartTotal: Cart.total.bind(Cart),

    // Session
    Session,

    // UI
    UI,

    // Sinkronisasi manual
    syncCart: () => Cart.syncUI()
  };

  /* =========================================================
     8. BOOTSTRAP
     ========================================================= */
  function boot() {
    Cart.init();
    UI.init();

    // Global error fallback (agar tidak membingungkan user)
    window.addEventListener('error', (e) => {
      console.warn('[EduSpark] Runtime error:', e.message);
    });

    // Console signature kecil untuk debugging
    console.log(
      '%cEduSpark Studio Pro%c v' + window.EduSpark.version,
      'background:linear-gradient(135deg,#4f46e5,#0ea5e9);color:#fff;padding:2px 8px;border-radius:6px;font-weight:700;',
      'color:#64748b;font-weight:600;'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window, document);