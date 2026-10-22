import { pultView, vitrinaView, lentaView } from './views.js';
import { charts } from './data.js';
import { areaChart, chartLabels, fmt } from './ui.js';

const VIEWS = { pult: pultView, vitrina: vitrinaView, lenta: lentaView };
const ORDER = ['pult', 'vitrina', 'lenta'];

const stage = document.getElementById('stage');
const picker = document.getElementById('variant-picker');
const selectWrap = document.querySelector('.variant-picker-select');
const select = selectWrap.querySelector('select');
const buttons = [...picker.querySelectorAll('button[data-variant]')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function activeId() {
  const param = new URLSearchParams(location.search).get('__variant');
  return ORDER.includes(param) ? param : 'pult';
}

/* ---------- counters ---------- */

function animateCounters(root) {
  root.querySelectorAll('.js-count').forEach((el) => {
    const target = Number(el.dataset.value);
    if (!Number.isFinite(target)) return;
    const unit = el.querySelector('.unit');
    const suffix = unit ? unit.outerHTML : '';
    if (reduceMotion) {
      el.innerHTML = fmt(target) + suffix;
      return;
    }
    const start = performance.now();
    const duration = 800;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.innerHTML = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- chart tabs ---------- */

function switchSeries(tab) {
  const scope = tab.closest('.card, .section') || stage;
  const chart = scope.querySelector('[data-chart]');
  const series = charts[tab.dataset.series];
  if (!chart || !series) return;

  const [width, height] = (chart.dataset.size || '1000x310').split('x').map(Number);
  chart.querySelector('.area-chart').outerHTML = areaChart({ values: series.values, id: chart.dataset.id, width, height });
  chart.querySelector('.chart-labels').outerHTML = chartLabels(series.labels);

  const growth = Math.round((series.values[series.values.length - 1] / series.values[0] - 1) * 100);
  const set = (field, text) => {
    const el = scope.querySelector(`[data-stat="${field}"]`);
    if (el) el.textContent = text;
  };
  set('avg', `${fmt(series.avg)} кг`);
  set('best', `${fmt(series.best)} кг`);
  set('growth', `+${growth}%`);
  set('period', series.label.toLowerCase());

  tab.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === tab)));
}

function switchSegmented(btn) {
  btn.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
}

/* ---------- views ---------- */

function show(id, { updateUrl = true } = {}) {
  stage.innerHTML = VIEWS[id]();
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.variant === id)));
  if (select.value !== id) select.value = id;
  animateCounters(stage);
  const active = buttons.find((b) => b.dataset.variant === id);
  if (active) active.scrollIntoView({ block: 'nearest' });
  if (updateUrl) {
    try {
      const url = new URL(location.href);
      url.searchParams.set('__variant', id);
      history.replaceState(null, '', url);
    } catch {
      /* file:// without history access */
    }
  }
}

/* ---------- picker wiring ---------- */

picker.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-variant]');
  if (btn) show(btn.dataset.variant);
});

select.addEventListener('change', () => show(select.value));

stage.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-chart-tabs] button');
  if (tab) {
    switchSeries(tab);
    return;
  }
  const seg = e.target.closest('.segmented button');
  if (seg) switchSegmented(seg);
});

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
  const target = e.target;
  if (target instanceof HTMLElement) {
    if (target.isContentEditable) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
  }

  if (e.key === 'h' || e.key === 'H') {
    picker.hidden = !picker.hidden;
    selectWrap.hidden = picker.hidden;
    return;
  }

  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
  e.preventDefault();
  const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
  const index = ORDER.indexOf(activeId());
  show(ORDER[(index + dir + ORDER.length) % ORDER.length]);
});

selectWrap.hidden = false;
show(activeId(), { updateUrl: false });
