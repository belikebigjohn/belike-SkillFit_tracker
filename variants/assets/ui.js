/* Small SVG helpers: icons, charts, rings. No dependencies. */

const ICONS = {
  home: '<path d="m3 10.4 9-7 9 7"/><path d="M5.5 9.5V21h13V9.5"/><path d="M10 21v-6h4v6"/>',
  dumbbell:
    '<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  trophy:
    '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3"/><path d="M7 5H4v2a3 3 0 0 0 3 3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  arrowRight: '<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m4.5 12.5 5 5L20 7"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8.5 10.5V7a3.5 3.5 0 0 1 7 0v3.5"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  trendingUp: '<path d="M3 17.5 9 11l4 4 8-8"/><path d="M16.5 7H21v4.5"/>',
  trendingDown: '<path d="M3 6.5 9 13l4-4 8 8"/><path d="M16.5 17H21v-4.5"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3.5 10.5h17"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  zap: '<path d="M13 2.5 4.5 14H11l-1 7.5L19.5 10H13z"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="M8 3.5 12 9l4-5.5"/>',
  layers: '<path d="m12 3 8.5 4.7-8.5 4.7-8.5-4.7z"/><path d="m3.5 12.6 8.5 4.7 8.5-4.7"/><path d="m3.5 17 8.5 4.7 8.5-4.7"/>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  video: '<rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="m15.5 11.5 6-3.5v8l-6-3.5z"/>',
  history: '<path d="M3 12a9 9 0 1 0 2.8-6.5"/><path d="M3 4v5h5"/><path d="M12 8v4.5l3 1.8"/>',
  filter: '<path d="M3.5 5.5h17"/><path d="M6.5 12h11"/><path d="M10 18.5h4"/>',
  run: '<circle cx="15" cy="4.5" r="2"/><path d="m9.5 21 2.5-5.5-3-3 1-4.5 3 3 3 .5"/><path d="m5 13 3-2.5"/><path d="m13 17 2 4"/>',
};

export function icon(name, size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

export const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

export function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/* ---------- area chart ---------- */

function smooth(points) {
  if (points.length < 2) return '';
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const t = 0.18;
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function areaChart({ values, id, width = 1000, height = 310, padX = 26, padTop = 34, padBottom = 22 }) {
  const max = Math.max(...values) * 1.08;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const points = values.map((v, i) => [
    padX + (i * innerW) / (values.length - 1),
    padTop + innerH - (v / max) * innerH,
  ]);
  const line = smooth(points);
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${height - padBottom} L${points[0][0].toFixed(1)},${height - padBottom} Z`;
  const grid = [0, 1, 2, 3]
    .map((i) => {
      const y = (padTop + (innerH * i) / 3).toFixed(1);
      return `<line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" stroke="rgba(255,255,255,.06)" stroke-dasharray="3 6" />`;
    })
    .join('');
  const dots = points
    .map(
      ([x, y], i) =>
        `<circle class="chart-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === points.length - 1 ? 4.5 : 3}" fill="${i === points.length - 1 ? '#c8f751' : '#0a0c0b'}" stroke="${i === points.length - 1 ? '#0a0c0b' : 'rgba(200,247,81,.55)'}" stroke-width="${i === points.length - 1 ? 3 : 1.5}" style="animation-delay:${320 + i * 55}ms" />`
    )
    .join('');
  const last = points[points.length - 1];
  const pillW = 78;
  const pillX = Math.min(last[0] - pillW / 2, width - padX - pillW);

  return `<svg class="area-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Объём тренировок по неделям">
    <defs>
      <linearGradient id="fill-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c8f751" stop-opacity=".26"/>
        <stop offset="55%" stop-color="#c8f751" stop-opacity=".07"/>
        <stop offset="100%" stop-color="#c8f751" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="stroke-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#8fb33a"/>
        <stop offset="55%" stop-color="#c8f751"/>
        <stop offset="100%" stop-color="#6ee7b7"/>
      </linearGradient>
    </defs>
    ${grid}
    <path d="${area}" fill="url(#fill-${id})" />
    <path class="chart-line" d="${line}" fill="none" stroke="url(#stroke-${id})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" />
    <line x1="${last[0].toFixed(1)}" y1="${last[1].toFixed(1)}" x2="${last[0].toFixed(1)}" y2="${height - padBottom}" stroke="rgba(200,247,81,.28)" stroke-dasharray="2 5" />
    <g class="chart-pill" style="animation-delay:620ms">
      <rect x="${pillX.toFixed(1)}" y="${(last[1] - 38).toFixed(1)}" width="${pillW}" height="26" rx="13" fill="#1b241c" stroke="rgba(200,247,81,.28)" />
      <text x="${(pillX + pillW / 2).toFixed(1)}" y="${(last[1] - 20).toFixed(1)}" text-anchor="middle" fill="#f2f5f1" font-size="12" font-weight="600" font-family="Onest, sans-serif">${fmt(values[values.length - 1])}</text>
    </g>
    ${dots}
  </svg>`;
}

export function chartLabels(labels) {
  return `<div class="chart-labels">${labels.map((l) => `<span>${l}</span>`).join('')}</div>`;
}

/* ---------- sparkline ---------- */

export function sparkline(values, { width = 78, height = 30, id }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values.map((v, i) => [
    (i * width) / (values.length - 1),
    height - 3 - ((v - min) / (max - min || 1)) * (height - 8),
  ]);
  const d = smooth(pts);
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true">
    <defs><linearGradient id="sp-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8f751" stop-opacity=".22"/><stop offset="100%" stop-color="#c8f751" stop-opacity="0"/></linearGradient></defs>
    <path d="${d} L${width},${height} L0,${height} Z" fill="url(#sp-${id})"/>
    <path d="${d}" fill="none" stroke="#c8f751" stroke-width="1.8" stroke-linecap="round" pathLength="1" class="spark-line"/>
    <circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="2.4" fill="#c8f751"/>
  </svg>`;
}

/* ---------- ring ---------- */

export function ring({ pct, size = 168, stroke = 13, label, sub, id = 'ring', tone = 'lime' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (1 - pct / 100);
  const grad = tone === 'mint' ? ['#6ee7b7', '#c8f751'] : ['#8fb33a', '#c8f751'];
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
      <defs><linearGradient id="rg-${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="${grad[0]}"/><stop offset="100%" stop-color="${grad[1]}"/></linearGradient></defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="${stroke}"/>
      <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#rg-${id})" stroke-width="${stroke}" stroke-linecap="round"
        transform="rotate(-90 ${size / 2} ${size / 2})" style="--c:${c.toFixed(2)};--t:${target.toFixed(2)};stroke-dasharray:${c.toFixed(2)}"/>
    </svg>
    <div class="ring-center"><span class="ring-value">${pct}<small>%</small></span>${sub ? `<span class="ring-sub">${sub}</span>` : ''}</div>
    ${label ? `<span class="visually-hidden">${label}</span>` : ''}
  </div>`;
}

/* ---------- donut ---------- */

export function donut(segments, { size = 150, stroke = 18, id = 'd' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const gap = 3.5;
  const arcs = segments
    .map((s, i) => {
      const len = (s.pct / 100) * c;
      const dash = `${Math.max(len - gap, 1).toFixed(2)} ${(c - Math.max(len - gap, 1)).toFixed(2)}`;
      const el = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${dash}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})" style="animation-delay:${i * 70}ms" />`;
      offset += len;
      return el;
    })
    .join('');
  return `<div class="donut">
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Распределение по группам мышц">${arcs}</svg>
    <div class="donut-center"><span class="donut-total">41</span><span class="donut-cap">упражнение</span></div>
  </div>`;
}

/* ---------- podium card ---------- */

export function avatar(u, cls = '') {
  return `<span class="avatar ${cls}" style="background:linear-gradient(140deg,${u.from},${u.to})" aria-hidden="true">${u.initials}</span>`;
}
