/* @ds-bundle: {"format":4,"namespace":"DS","components":[{"name":"Button"},{"name":"Field"},{"name":"Badge"}]} */
/* Components JS · Dropdown, DatePicker, Segmented. Без залежностей. */
(function () {
  const CHECK = '<svg class="check-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  let uid = 0;
  const openSet = new Set();
  const closeAll = (except) => openSet.forEach(c => c !== except && c.close());

  /* Телефон (≤640px): список і календар відкриваються шторкою знизу (CSS), тут — затемнення за нею. */
  const sheetMQ = window.matchMedia('(max-width: 640px)');
  let scrim;
  function syncScrim() {
    if (!scrim) { scrim = document.createElement('div'); scrim.className = 'ds-scrim'; scrim.setAttribute('aria-hidden', 'true'); document.body.appendChild(scrim); }
    scrim.classList.toggle('is-on', sheetMQ.matches && [...openSet].some(c => !c.inline));
  }
  sheetMQ.addEventListener && sheetMQ.addEventListener('change', syncScrim);

  /* У превʼю-iframe відкритий поповер не повинен обрізатися краєм рамки: тимчасово додаємо сторінці висоту. */
  function ensureRoom(root, pop) {
    if (window.self === window.top || sheetMQ.matches) return;
    const r = pop.getBoundingClientRect(), top = window.scrollY;
    if (!root.classList.contains('is-up')) document.body.style.minHeight = Math.ceil(r.bottom + top + 16) + 'px';
  }
  const releaseRoom = () => { if (!openSet.size) document.body.style.minHeight = ''; };

  function placeUp(root, pop) {
    if (sheetMQ.matches) { root.classList.remove('is-up'); return; }
    const r = root.getBoundingClientRect();
    const h = Math.min(pop.scrollHeight, 360) + 12;
    root.classList.toggle('is-up', window.innerHeight - r.bottom < h && r.top > h);
  }

  /* ---------- Dropdown (select / menu) ---------- */
  class Dropdown {
    constructor(root) {
      this.root = root; this.trigger = root.querySelector('.dd__trigger'); this.menu = root.querySelector('.dd__menu');
      this.isMenu = root.dataset.dd === 'menu'; this.value = root.dataset.value || null;
      this.valueEl = root.querySelector('.dd__value'); this.placeholder = this.valueEl ? this.valueEl.textContent : '';
      this.search = root.querySelector('.dd__search input');
      const id = 'dd' + (++uid);
      this.menu.id = id; this.menu.setAttribute('role', this.isMenu ? 'menu' : 'listbox'); this.menu.tabIndex = -1;
      this.trigger.setAttribute('aria-haspopup', this.isMenu ? 'menu' : 'listbox');
      this.trigger.setAttribute('aria-expanded', 'false'); this.trigger.setAttribute('aria-controls', id);
      this.opts().forEach((o, i) => {
        o.id = id + '-' + i; o.setAttribute('role', this.isMenu ? 'menuitem' : 'option');
        if (!this.isMenu) { o.setAttribute('aria-selected', o.dataset.value === this.value ? 'true' : 'false'); if (!o.querySelector('.check-ic')) o.insertAdjacentHTML('beforeend', CHECK); }
      });
      if (this.value) this.render();
      this.trigger.addEventListener('click', () => this.isOpen() ? this.close() : this.open());
      this.trigger.addEventListener('keydown', e => this.onKey(e, true));
      this.menu.addEventListener('keydown', e => this.onKey(e, false));
      this.menu.addEventListener('mousemove', e => { const o = e.target.closest('.dd__opt'); if (o && !o.hidden) this.setActive(o, false); });
      this.menu.addEventListener('click', e => { const o = e.target.closest('.dd__opt'); if (o) this.choose(o); });
      if (this.search) this.search.addEventListener('input', () => this.filter(this.search.value));
      this.buf = ''; this.bufT = 0;
    }
    opts() { return [...this.menu.querySelectorAll('.dd__opt')]; }
    visible() { return this.opts().filter(o => !o.hidden && o.getAttribute('aria-disabled') !== 'true'); }
    isOpen() { return this.root.classList.contains('is-open'); }
    open() {
      closeAll(this); openSet.add(this); placeUp(this.root, this.menu);
      this.root.classList.add('is-open'); this.trigger.setAttribute('aria-expanded', 'true');
      syncScrim(); ensureRoom(this.root, this.menu);
      const sel = this.opts().find(o => o.dataset.value === this.value) || this.visible()[0];
      this.setActive(sel, true);
      (this.search && !sheetMQ.matches ? this.search : this.menu).focus({ preventScroll: true }); /* на телефоні не викликаємо клавіатуру без потреби */
    }
    close(focus) {
      if (!this.isOpen()) return;
      this.root.classList.remove('is-open'); this.trigger.setAttribute('aria-expanded', 'false'); openSet.delete(this); syncScrim(); releaseRoom();
      if (this.search) { this.search.value = ''; this.filter(''); }
      if (focus) this.trigger.focus();
    }
    setActive(o, scroll) {
      this.opts().forEach(x => x.classList.toggle('is-active', x === o));
      this.active = o;
      if (o) { this.menu.setAttribute('aria-activedescendant', o.id); if (scroll) o.scrollIntoView({ block: 'nearest' }); }
    }
    move(d) {
      const v = this.visible(); if (!v.length) return;
      let i = v.indexOf(this.active); i = i < 0 ? 0 : (i + d + v.length) % v.length; this.setActive(v[i], true);
    }
    choose(o) {
      if (!o || o.getAttribute('aria-disabled') === 'true') return;
      if (!this.isMenu) {
        this.value = o.dataset.value; this.opts().forEach(x => x.setAttribute('aria-selected', x === o ? 'true' : 'false')); this.render();
      }
      this.root.dispatchEvent(new CustomEvent('dd:change', { detail: { value: o.dataset.value, label: o.dataset.label || o.textContent.trim() }, bubbles: true }));
      this.close(true);
    }
    render() {
      const o = this.opts().find(x => x.dataset.value === this.value);
      if (!o || !this.valueEl) return;
      const lead = o.querySelector('.lead-ic, .dd__swatch');
      this.valueEl.innerHTML = (lead ? lead.outerHTML : '') + '<span>' + (o.dataset.label || o.childNodes[0].textContent.trim() || o.textContent.trim()) + '</span>';
      this.valueEl.classList.remove('is-placeholder');
    }
    filter(q) {
      q = q.trim().toLowerCase(); let any = false;
      this.opts().forEach(o => { const m = !q || o.textContent.toLowerCase().includes(q); o.hidden = !m; any = any || m; });
      this.menu.querySelectorAll('.dd__group').forEach(g => {
        let n = g.nextElementSibling, show = false;
        while (n && !n.classList.contains('dd__group')) { if (n.classList.contains('dd__opt') && !n.hidden) show = true; n = n.nextElementSibling; }
        g.hidden = !show;
      });
      let e = this.menu.querySelector('.dd__empty');
      if (!any) { if (!e) { e = document.createElement('div'); e.className = 'dd__empty'; e.textContent = 'Нічого не знайдено'; this.menu.appendChild(e); } }
      else if (e) e.remove();
      this.setActive(this.visible()[0], true);
    }
    onKey(e, fromTrigger) {
      const k = e.key;
      if (fromTrigger && !this.isOpen()) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(k)) { e.preventDefault(); this.open(); }
        return;
      }
      if (k === 'ArrowDown') { e.preventDefault(); this.move(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); this.move(-1); }
      else if (k === 'Home') { e.preventDefault(); this.setActive(this.visible()[0], true); }
      else if (k === 'End') { e.preventDefault(); const v = this.visible(); this.setActive(v[v.length - 1], true); }
      else if (k === 'Enter' || (k === ' ' && e.target !== this.search)) { e.preventDefault(); this.choose(this.active); }
      else if (k === 'Escape') { e.preventDefault(); this.close(true); }
      else if (k === 'Tab') { this.close(); }
      else if (!this.search && k.length === 1 && /\S/.test(k)) {
        clearTimeout(this.bufT); this.buf += k.toLowerCase(); this.bufT = setTimeout(() => this.buf = '', 600);
        const m = this.visible().find(o => o.textContent.trim().toLowerCase().startsWith(this.buf)); if (m) this.setActive(m, true);
      }
    }
  }

  /* ---------- Date picker ---------- */
  const MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
  const MONTHS_GEN = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  const d0 = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const same = (a, b) => a && b && a.getTime() === b.getTime();
  const fmt = (d, y = true) => d.getDate() + ' ' + MONTHS_GEN[d.getMonth()] + (y ? ' ' + d.getFullYear() : '');
  const ICON = p => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';

  class DatePicker {
    constructor(root) {
      this.root = root; this.range = root.dataset.mode === 'range'; this.inline = root.classList.contains('dp--inline');
      this.today = d0(new Date()); this.min = root.dataset.min === 'today' ? this.today : null;
      this.start = null; this.end = null; this.hover = null;
      this.view = new Date(this.today.getFullYear(), this.today.getMonth(), 1); this.focusDate = this.today;
      this.trigger = root.querySelector('.dd__trigger'); this.valueEl = root.querySelector('.dd__value');
      this.placeholder = this.valueEl ? this.valueEl.textContent : '';
      this.pop = root.querySelector('.dp__pop');
      this.pop.setAttribute('role', 'dialog'); this.pop.setAttribute('aria-label', this.range ? 'Вибір періоду' : 'Вибір дати');
      this.pop.innerHTML = `<div class="cal__head"><div class="cal__title" aria-live="polite"></div><div class="cal__nav">
        <button class="btn btn--ghost btn--sm btn--icon" data-nav="-1" aria-label="Попередній місяць">${ICON('<path d="m15 6-6 6 6 6"/>')}</button>
        <button class="btn btn--ghost btn--sm btn--icon" data-nav="1" aria-label="Наступний місяць">${ICON('<path d="m9 6 6 6-6 6"/>')}</button></div></div>
        <div class="cal__grid"></div>
        <div class="cal__foot"><span class="spec"></span><div style="display:flex;gap:4px"><button class="btn btn--ghost btn--sm" data-act="clear">Очистити</button><button class="btn btn--outline btn--sm" data-act="today">Сьогодні</button></div></div>`;
      this.grid = this.pop.querySelector('.cal__grid'); this.title = this.pop.querySelector('.cal__title'); this.foot = this.pop.querySelector('.cal__foot .spec');
      this.pop.addEventListener('click', e => {
        const n = e.target.closest('[data-nav]'); if (n) { this.shift(+n.dataset.nav); return; }
        const a = e.target.closest('[data-act]');
        if (a) { if (a.dataset.act === 'clear') { this.start = this.end = null; this.commit(false); } else { this.view = new Date(this.today.getFullYear(), this.today.getMonth(), 1); this.focusDate = this.today; this.pick(this.today); } return; }
        const d = e.target.closest('.cal__day'); if (d && !d.disabled) this.pick(new Date(+d.dataset.t));
      });
      this.grid.addEventListener('mouseover', e => { const d = e.target.closest('.cal__day'); if (this.range && this.start && !this.end && d) { this.hover = new Date(+d.dataset.t); this.paint(); } });
      this.grid.addEventListener('keydown', e => this.onKey(e));
      if (this.trigger) {
        this.trigger.setAttribute('aria-haspopup', 'dialog'); this.trigger.setAttribute('aria-expanded', 'false');
        this.trigger.addEventListener('click', () => this.isOpen() ? this.close() : this.open());
        this.trigger.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); this.open(); } });
      }
      this.pop.addEventListener('keydown', e => { if (e.key === 'Escape' && !this.inline) { e.preventDefault(); this.close(true); } });
      this.render();
    }
    isOpen() { return this.root.classList.contains('is-open'); }
    open() { closeAll(this); openSet.add(this); placeUp(this.root, this.pop); this.root.classList.add('is-open'); this.trigger.setAttribute('aria-expanded', 'true'); syncScrim();
      if (this.start) { this.view = new Date(this.start.getFullYear(), this.start.getMonth(), 1); this.focusDate = this.start; } this.render(); ensureRoom(this.root, this.pop); this.focusDay(); }
    close(focus) { if (!this.isOpen()) return; this.root.classList.remove('is-open'); this.trigger.setAttribute('aria-expanded', 'false'); openSet.delete(this); syncScrim(); releaseRoom(); if (focus) this.trigger.focus(); }
    shift(m) { this.view = new Date(this.view.getFullYear(), this.view.getMonth() + m, 1); this.render(); }
    disabled(d) { return this.min && d < this.min; }
    pick(d) {
      if (this.disabled(d)) return;
      this.focusDate = d;
      if (!this.range) { this.start = d; this.commit(true); return; }
      if (!this.start || this.end || d < this.start) { this.start = d; this.end = null; this.hover = null; this.paint(); this.updateFoot(); this.focusDay(); return; }
      this.end = d; this.commit(true);
    }
    commit(close) {
      this.paint(); this.updateFoot();
      if (this.valueEl) {
        const t = !this.start ? this.placeholder : this.range ? (this.end ? (this.start.getFullYear() === this.end.getFullYear() ? fmt(this.start, false) : fmt(this.start)) + ' — ' + fmt(this.end) : fmt(this.start) + ' — …') : fmt(this.start);
        this.valueEl.querySelector('span').textContent = t; this.valueEl.classList.toggle('is-placeholder', !this.start);
      }
      this.root.dispatchEvent(new CustomEvent('dp:change', { detail: { start: this.start, end: this.end }, bubbles: true }));
      if (close && !this.inline) setTimeout(() => this.close(true), 160);
    }
    updateFoot() {
      if (!this.range) { this.foot.textContent = this.start ? fmt(this.start) : 'Дату не вибрано'; return; }
      if (this.start && this.end) { const n = Math.round((this.end - this.start) / 864e5); this.foot.textContent = n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'ніч' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'ночі' : 'ночей'); }
      else this.foot.textContent = this.start ? 'Оберіть дату виїзду' : 'Оберіть дату заїзду';
    }
    render() {
      const y = this.view.getFullYear(), m = this.view.getMonth();
      this.title.innerHTML = MONTHS[m] + ' <span>' + y + '</span>';
      const first = (new Date(y, m, 1).getDay() + 6) % 7, startD = new Date(y, m, 1 - first);
      let h = WD.map(w => `<div class="cal__wd" aria-hidden="true">${w}</div>`).join('');
      for (let i = 0; i < 42; i++) {
        const d = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate() + i);
        h += `<button class="cal__day${d.getMonth() !== m ? ' is-out' : ''}${same(d, this.today) ? ' is-today' : ''}" data-t="${d.getTime()}" tabindex="-1" ${this.disabled(d) ? 'disabled' : ''} aria-label="${fmt(d)}"><span>${d.getDate()}</span></button>`;
      }
      this.grid.innerHTML = h; this.paint(); this.updateFoot();
    }
    paint() {
      const s = this.start, e = this.end || (this.range && this.start && this.hover && this.hover > this.start ? this.hover : null);
      this.grid.querySelectorAll('.cal__day').forEach(b => {
        const d = new Date(+b.dataset.t);
        b.classList.toggle('is-sel', !this.range && same(d, s));
        b.classList.toggle('is-start', this.range && same(d, s));
        b.classList.toggle('is-end', this.range && !!e && same(d, e));
        b.classList.toggle('has-range', this.range && !!e && (same(d, s) || same(d, e)) && !same(s, e));
        b.classList.toggle('is-in', this.range && !!e && d > s && d < e);
        b.setAttribute('aria-pressed', (same(d, s) || same(d, e)) ? 'true' : 'false');
        b.tabIndex = same(d, this.focusDate) ? 0 : -1;
      });
    }
    focusDay() {
      let b = this.grid.querySelector(`.cal__day[data-t="${this.focusDate.getTime()}"]`);
      if (!b) b = this.grid.querySelector('.cal__day:not(.is-out)');
      this.grid.querySelectorAll('.cal__day').forEach(x => x.tabIndex = x === b ? 0 : -1);
      b && b.focus({ preventScroll: true });
    }
    onKey(e) {
      const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      let d = null;
      if (map[e.key] !== undefined) d = new Date(this.focusDate.getFullYear(), this.focusDate.getMonth(), this.focusDate.getDate() + map[e.key]);
      else if (e.key === 'PageUp' || e.key === 'PageDown') d = new Date(this.focusDate.getFullYear(), this.focusDate.getMonth() + (e.key === 'PageUp' ? -1 : 1), this.focusDate.getDate());
      else if (e.key === 'Home') d = new Date(this.focusDate.getFullYear(), this.focusDate.getMonth(), this.focusDate.getDate() - (this.focusDate.getDay() + 6) % 7);
      else if (e.key === 'End') d = new Date(this.focusDate.getFullYear(), this.focusDate.getMonth(), this.focusDate.getDate() + 6 - (this.focusDate.getDay() + 6) % 7);
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.pick(this.focusDate); return; }
      if (!d) return;
      e.preventDefault(); this.focusDate = d;
      if (d.getMonth() !== this.view.getMonth() || d.getFullYear() !== this.view.getFullYear()) { this.view = new Date(d.getFullYear(), d.getMonth(), 1); this.render(); }
      if (this.range && this.start && !this.end) { this.hover = d; }
      this.paint(); this.focusDay();
    }
  }

  /* ---------- Segmented (glass thumb) ---------- */
  class Segmented {
    constructor(root) {
      this.root = root; this.btns = [...root.querySelectorAll('.segmented__btn')];
      this.thumb = document.createElement('span'); this.thumb.className = 'segmented__thumb'; root.prepend(this.thumb);
      this.btns.forEach(b => b.addEventListener('click', () => this.select(b, true)));
      root.addEventListener('keydown', e => {
        const i = this.btns.findIndex(b => b.getAttribute('aria-pressed') === 'true');
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = this.btns[(i + (e.key === 'ArrowRight' ? 1 : -1) + this.btns.length) % this.btns.length]; this.select(n, true); n.focus(); }
      });
      const cur = this.btns.find(b => b.getAttribute('aria-pressed') === 'true') || this.btns[0];
      requestAnimationFrame(() => { this.thumb.style.transition = 'none'; this.select(cur, false); requestAnimationFrame(() => this.thumb.style.transition = ''); });
      new ResizeObserver(() => this.place()).observe(root);
    }
    place() { const b = this.btns.find(x => x.getAttribute('aria-pressed') === 'true'); if (!b) return; this.thumb.style.width = b.offsetWidth + 'px'; this.thumb.style.transform = `translateX(${b.offsetLeft}px)`; }
    select(b, emit) {
      const was = this.btns.find(x => x.getAttribute('aria-pressed') === 'true');
      this.btns.forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); this.place();
      if (emit && was !== b) {
        this.thumb.classList.remove('is-moving'); void this.thumb.offsetWidth; this.thumb.classList.add('is-moving');
        this.root.dispatchEvent(new CustomEvent('seg:change', { detail: { value: b.dataset.value }, bubbles: true }));
      }
    }
    set(v) { const b = this.btns.find(x => x.dataset.value === v); if (b) this.select(b, false); }
  }

  document.addEventListener('pointerdown', e => openSet.forEach(c => { if (!c.root.contains(e.target)) c.close(); }));
  window.DS = {
    init(scope = document) {
      scope.querySelectorAll('[data-dd]').forEach(r => r._c || (r._c = new Dropdown(r)));
      scope.querySelectorAll('[data-dp]').forEach(r => r._c || (r._c = new DatePicker(r)));
      scope.querySelectorAll('.segmented').forEach(r => r._c || (r._c = new Segmented(r)));
    }
  };
})();

/* ---------- Part 2: Tabs, Accordion, Modal, Toast, Tooltip, Table ---------- */
(function () {
  const base = window.DS.init;
  const SV = p => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  const IC = {
    success: SV('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>'),
    error: SV('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>'),
    warning: SV('<path d="M12 4 2.8 19.5h18.4L12 4Z"/><path d="M12 10v4M12 17h.01"/>'),
    info: SV('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/>'),
    x: SV('<path d="M7 7l10 10M17 7 7 17"/>')
  };
  let uid = 0;

  class Tabs {
    constructor(root) {
      this.list = root.querySelector('.tabs__list'); this.tabs = [...root.querySelectorAll('.tabs__tab')];
      this.ink = document.createElement('span'); this.ink.className = 'tabs__ink'; this.list.appendChild(this.ink);
      this.list.setAttribute('role', 'tablist');
      this.tabs.forEach((t, i) => {
        const p = root.querySelector('#' + t.getAttribute('aria-controls'));
        t.setAttribute('role', 'tab'); t.id = t.id || 'tab' + (++uid); p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', t.id); p.tabIndex = 0;
        t.addEventListener('click', () => this.select(t, true));
      });
      this.list.addEventListener('keydown', e => {
        const i = this.tabs.indexOf(document.activeElement); if (i < 0) return;
        let n = null;
        if (e.key === 'ArrowRight') n = this.tabs[(i + 1) % this.tabs.length];
        if (e.key === 'ArrowLeft') n = this.tabs[(i - 1 + this.tabs.length) % this.tabs.length];
        if (e.key === 'Home') n = this.tabs[0]; if (e.key === 'End') n = this.tabs[this.tabs.length - 1];
        if (n) { e.preventDefault(); n.focus(); this.select(n, true); }
      });
      const cur = this.tabs.find(t => t.getAttribute('aria-selected') === 'true') || this.tabs[0];
      this.select(cur, false); new ResizeObserver(() => this.place()).observe(this.list);
    }
    place() { const t = this.tabs.find(x => x.getAttribute('aria-selected') === 'true'); if (!t) return; this.ink.style.width = t.offsetWidth + 'px'; this.ink.style.transform = `translateX(${t.offsetLeft}px)`; }
    select(t, anim) {
      this.tabs.forEach(x => {
        const on = x === t, p = document.getElementById(x.getAttribute('aria-controls'));
        x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; p.hidden = !on;
        if (on && anim) { p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); }
      });
      this.place();
    }
  }

  class Accordion {
    constructor(root) {
      this.single = root.dataset.acc === 'single';
      root.querySelectorAll('.acc__item').forEach(it => {
        const b = it.querySelector('.acc__btn'), p = it.querySelector('.acc__panel');
        p.id = p.id || 'acc' + (++uid); b.setAttribute('aria-controls', p.id); b.setAttribute('aria-expanded', it.classList.contains('is-open'));
        p.setAttribute('role', 'region'); p.setAttribute('aria-labelledby', b.id = b.id || 'accb' + uid);
        b.addEventListener('click', () => {
          const open = !it.classList.contains('is-open');
          if (this.single) root.querySelectorAll('.acc__item.is-open').forEach(o => { if (o !== it) { o.classList.remove('is-open'); o.querySelector('.acc__btn').setAttribute('aria-expanded', false); } });
          it.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open);
        });
      });
    }
  }

  /* Modal / drawer: focus trap, Esc, overlay click, scroll lock, return focus */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  const stack = [];
  class Modal {
    constructor(root) {
      this.root = root; this.dialog = root.querySelector('.modal__dialog');
      this.dialog.setAttribute('role', root.dataset.role || 'dialog'); this.dialog.setAttribute('aria-modal', 'true');
      const t = root.querySelector('.modal__title'); if (t) { t.id = t.id || 'mt' + (++uid); this.dialog.setAttribute('aria-labelledby', t.id); }
      root.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.classList.contains('modal__overlay')) this.close(); });
      root.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.stopPropagation(); this.close(); }
        if (e.key === 'Tab') {
          const f = [...this.dialog.querySelectorAll(FOCUSABLE)].filter(x => x.offsetParent !== null); if (!f.length) return;
          const a = f[0], z = f[f.length - 1];
          if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
          else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
        }
      });
    }
    open(opener) {
      this.opener = opener || document.activeElement; this.root.classList.add('is-open'); stack.push(this);
      document.documentElement.classList.add('is-locked');
      setTimeout(() => { const f = this.dialog.querySelector('[autofocus]') || this.dialog.querySelector(FOCUSABLE); f && f.focus(); }, 60);
    }
    close() {
      this.root.classList.remove('is-open'); stack.splice(stack.indexOf(this), 1);
      if (!stack.length) document.documentElement.classList.remove('is-locked');
      this.opener && this.opener.focus && this.opener.focus();
      this.root.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));
    }
  }

  /* Toast */
  let host;
  function toast({ type = 'success', title = '', text = '', action, duration = 5000 } = {}) {
    if (!host) { host = document.createElement('div'); host.className = 'toasts'; host.setAttribute('aria-live', 'polite'); host.setAttribute('aria-relevant', 'additions'); document.body.appendChild(host); }
    const el = document.createElement('div'); el.className = `toast toast--${type} glass-strong`; el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<span class="toast__ic">${IC[type]}</span><div class="toast__body"><b>${title}</b>${text}${action ? `<div class="toast__action"><button class="btn btn--outline btn--sm">${action.label}</button></div>` : ''}</div>
      <button class="btn btn--ghost btn--sm btn--icon toast__close" aria-label="Закрити">${IC.x}</button><span class="toast__bar"></span>`;
    host.appendChild(el); while (host.children.length > 4) host.firstElementChild.remove();
    const bar = el.querySelector('.toast__bar'); let left = duration, t0 = Date.now(), timer, raf;
    const remove = () => { cancelAnimationFrame(raf); clearTimeout(timer); el.classList.add('is-out'); setTimeout(() => el.remove(), 220); };
    const tick = () => { const p = Math.max(0, (left - (Date.now() - t0)) / duration); bar.style.transform = `scaleX(${p})`; raf = requestAnimationFrame(tick); };
    const start = () => { t0 = Date.now(); timer = setTimeout(remove, left); tick(); };
    const pause = () => { clearTimeout(timer); cancelAnimationFrame(raf); left -= Date.now() - t0; };
    if (duration) { start(); el.addEventListener('mouseenter', pause); el.addEventListener('mouseleave', start); el.addEventListener('focusin', pause); }
    else bar.remove();
    el.querySelector('.toast__close').onclick = remove;
    if (action) el.querySelector('.toast__action .btn').onclick = () => { action.onClick && action.onClick(); remove(); };
    return { close: remove };
  }

  /* Tooltip: [data-tip], hover/focus, 350ms delay, flips below near top edge */
  let tipEl, tipT;
  function tooltips(scope) {
    scope.querySelectorAll('[data-tip]').forEach(el => {
      if (el._tip) return; el._tip = 1;
      const show = () => { clearTimeout(tipT); tipT = setTimeout(() => {
        if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tooltip glass-strong'; tipEl.setAttribute('role', 'tooltip'); tipEl.id = 'ds-tip'; document.body.appendChild(tipEl); }
        tipEl.innerHTML = el.dataset.tip + (el.dataset.kbd ? `<kbd>${el.dataset.kbd}</kbd>` : ''); el.setAttribute('aria-describedby', 'ds-tip');
        const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight, below = r.top < h + 16;
        tipEl.classList.toggle('is-below', below);
        tipEl.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
        tipEl.style.top = (below ? r.bottom + 8 : r.top - h - 8) + 'px';
        tipEl.classList.add('is-on'); }, 350); };
      const hide = () => { clearTimeout(tipT); tipEl && tipEl.classList.remove('is-on'); el.removeAttribute('aria-describedby'); };
      el.addEventListener('mouseenter', show); el.addEventListener('mouseleave', hide); el.addEventListener('focus', show); el.addEventListener('blur', hide);
      el.addEventListener('keydown', e => e.key === 'Escape' && hide()); el.addEventListener('click', hide);
    });
  }

  /* Table: sort, select, bulk bar, search filter */
  class Table {
    constructor(root) {
      this.root = root; this.tbody = root.querySelector('tbody'); this.all = root.querySelector('thead .check');
      this.bulk = root.querySelector('.bulkbar'); this.count = root.querySelector('[data-count]');
      root.querySelectorAll('.th-sort').forEach(b => b.addEventListener('click', () => this.sort(b)));
      this.tbody.addEventListener('change', e => { if (e.target.classList.contains('check')) this.sync(); });
      this.all && this.all.addEventListener('change', () => { this.rows().forEach(r => r.querySelector('.check').checked = this.all.checked); this.sync(); });
      const q = root.querySelector('[data-filter]'); q && q.addEventListener('input', () => {
        const v = q.value.trim().toLowerCase(); let n = 0;
        [...this.tbody.rows].forEach(r => { const m = !v || r.textContent.toLowerCase().includes(v); r.hidden = !m; n += m; });
        const e = root.querySelector('[data-empty]'); if (e) e.hidden = n > 0;
      });
      root.querySelectorAll('[data-clear-sel]').forEach(b => b.onclick = () => { this.rows().forEach(r => r.querySelector('.check').checked = false); this.sync(); });
    }
    rows() { return [...this.tbody.rows].filter(r => !r.hidden && r.querySelector('.check')); }
    sync() {
      const rs = this.rows(), n = rs.filter(r => r.querySelector('.check').checked).length;
      [...this.tbody.rows].forEach(r => { const c = r.querySelector('.check'); r.classList.toggle('is-selected', !!c && c.checked); });
      if (this.all) { this.all.checked = n && n === rs.length; this.all.indeterminate = n > 0 && n < rs.length; }
      if (this.bulk) { this.bulk.classList.toggle('is-on', n > 0); this.count.textContent = n; }
    }
    sort(btn) {
      const th = btn.closest('th'), idx = [...th.parentNode.children].indexOf(th), type = th.dataset.type || 'text';
      const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
      th.parentNode.querySelectorAll('th').forEach(x => x.removeAttribute('aria-sort')); th.setAttribute('aria-sort', dir);
      const val = r => { const c = r.cells[idx]; const v = c.dataset.v ?? c.textContent.trim(); return type === 'num' ? parseFloat(v) : v.toLowerCase(); };
      [...this.tbody.rows].sort((a, b) => { const x = val(a), y = val(b); return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'ascending' ? 1 : -1); }).forEach(r => this.tbody.appendChild(r));
    }
  }

  window.DS.toast = toast;
  window.DS.modal = id => document.getElementById(id)._c;
  window.DS.init = function (scope = document) {
    base(scope);
    scope.querySelectorAll('[data-tabs]').forEach(r => r._c || (r._c = new Tabs(r)));
    scope.querySelectorAll('[data-acc]').forEach(r => r._c || (r._c = new Accordion(r)));
    scope.querySelectorAll('.modal').forEach(r => r._c || (r._c = new Modal(r)));
    scope.querySelectorAll('[data-table]').forEach(r => r._c || (r._c = new Table(r)));
    scope.querySelectorAll('[data-open]').forEach(b => b._o || (b._o = b.addEventListener('click', () => DS.modal(b.dataset.open).open(b))));
    tooltips(scope);
  };
})();

/* ---------- React-шар ----------
   Тонкі обгортки над тією самою розміткою й класами з bundle.css (джерело правди — CSS, не JS).
   Працює, лише якщо window.React уже завантажено до цього файла (React 18+). Поведінку складних
   компонентів (.dd, .dp, таби, модалки) як і раніше дає DS.init — див. DS.useDS. */
(function () {
  const R = window.React;
  if (!R) return;
  const h = R.createElement;
  const cx = (...a) => a.filter(Boolean).join(' ');
  const warned = {};
  const warn = (key, msg) => { if (!warned[key]) { warned[key] = 1; console.warn('[DS] ' + msg); } };

  /* DS.useDS(ref, deps): викликає DS.init(ref.current) після монтування й після зміни deps.
     Для контейнера, де лежить розмітка з .dd / .dp / [data-tabs] / [data-acc] / .modal / [data-table] / [data-tip]. */
  function useDS(ref, deps) {
    R.useEffect(() => { if (ref.current) window.DS.init(ref.current); }, deps || []);
  }

  /* Button — variant: primary | secondary | accent | outline | ghost | danger; size: sm | md | lg.
     icon — квадратна кнопка-іконка (обовʼязковий aria-label), round — капсула, block — на всю ширину, loading — спінер. */
  const Button = R.forwardRef(function Button(props, ref) {
    const { variant = 'primary', size = 'md', icon = false, round = false, block = false, loading = false,
            type = 'button', className, children, onClick, ...rest } = props;
    if (icon && !rest['aria-label'] && !rest['aria-labelledby']) warn('btn-icon', 'Button icon потребує aria-label.');
    return h('button', Object.assign({}, rest, {
      ref, type,
      className: cx('btn', 'btn--' + variant, size !== 'md' && 'btn--' + size, icon && 'btn--icon', round && 'btn--round', block && 'btn--block', loading && 'is-loading', className),
      'aria-busy': loading || undefined,
      onClick: loading ? e => e.preventDefault() : onClick,
    }), children);
  });

  /* Badge — tone: neutral | brand | success | warning | error | info | accent.
     solid — залита (один акцент на картці), dot — з крапкою (таблиці, списки), count — лічильник.
     Статус завжди словом: children обовʼязкові. */
  function Badge(props) {
    const { tone = 'neutral', solid = false, dot = false, count = false, className, children, ...rest } = props;
    return h('span', Object.assign({}, rest, {
      className: cx('badge', count ? 'badge--count' : (tone !== 'neutral' && 'badge--' + tone), solid && !count && 'badge--solid', dot && 'badge--dot', className),
    }), children);
  }

  /* Field — мітка над полем, підказка під ним. error (рядок) замінює help і вмикає стан помилки.
     icon — вузол (svg) ліворуч, suffix — текст праворуч (₴, кг), multiline — textarea, optional — позначка «необовʼязково».
     Решта пропсів (value, onChange, type, placeholder, disabled…) іде в input / textarea. */
  const Field = R.forwardRef(function Field(props, ref) {
    const { label, help, error, optional = false, optionalLabel = '· необов’язково', icon, suffix, multiline = false,
            id, className, ...inputProps } = props;
    const auto = R.useId();
    const fid = id || 'f' + auto.replace(/:/g, '');
    const hid = fid + '-help';
    const note = error && error !== true ? error : help;
    const control = h(multiline ? 'textarea' : 'input', Object.assign({}, inputProps, {
      ref, id: fid, className: multiline ? 'textarea' : 'input',
      'aria-invalid': error ? true : undefined,
      'aria-describedby': note ? hid : inputProps['aria-describedby'],
    }));
    const wrapped = (icon || suffix) && !multiline
      ? h('div', { className: 'input-wrap' }, icon, control, suffix ? h('span', { className: 'input-suffix' }, suffix) : null)
      : control;
    return h('div', { className: cx('field', error && 'is-error', className) },
      label ? h('label', { className: 'field__label', htmlFor: fid }, label, optional ? ' ' : null, optional ? h('span', { className: 'opt' }, optionalLabel) : null) : null,
      wrapped,
      note ? h('span', { className: 'field__help', id: hid }, note) : null);
  });

  Object.assign(window.DS, { Button, Badge, Field, useDS });
})();
