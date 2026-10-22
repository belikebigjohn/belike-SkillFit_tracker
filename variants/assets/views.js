import { user, week, charts, muscles, achievements, leaderboard, sessions, records, sparklines } from './data.js';
import { icon, fmt, plural, areaChart, chartLabels, sparkline, ring, donut, avatar } from './ui.js';

const iconBtnMore = (label) =>
  `<button class="icon-btn icon-btn--sm" type="button" aria-label="${label}">${icon('more', 16)}</button>`;

const chartTabs = (active) => `
  <div class="tabs" role="group" aria-label="Период графика" data-chart-tabs>
    ${Object.entries(charts)
      .map(
        ([key, s]) =>
          `<button type="button" data-series="${key}" aria-pressed="${key === active}">${s.label}</button>`
      )
      .join('')}
  </div>`;

const chartBlock = (active, id, opts = {}) => {
  const s = charts[active];
  return `<div class="chart" data-chart data-series="${active}" data-id="${id}" data-size="${opts.width || 1000}x${opts.height || 310}">
      ${areaChart({ values: s.values, id, ...opts })}
      ${chartLabels(s.labels)}
    </div>`;
};

const chartFoot = (s) => `
  <div class="chart-foot">
    <div><span>Среднее</span><strong data-stat="avg">${fmt(s.avg)} кг</strong></div>
    <div><span>Лучший период</span><strong data-stat="best">${fmt(s.best)} кг</strong></div>
    <div><span>Рост за период</span><strong class="is-up" data-stat="growth">+${Math.round((s.values[s.values.length - 1] / s.values[0] - 1) * 100)}%</strong></div>
  </div>`;

/* ============================================================
   V1 — «Пульт»: плотная сетка, всё на одном экране
   ============================================================ */

export function pultView() {
  const kpis = [
    { label: 'Очки', value: user.points, delta: '+142', note: 'за неделю', icon: 'zap', spark: sparklines.points },
    { label: 'Серия', value: user.streak, unit: 'дней', delta: '+5', note: 'личный рекорд', icon: 'flame', spark: sparklines.streak },
    { label: 'Тренировки', value: user.workouts, delta: '+3', note: 'за неделю', icon: 'dumbbell', spark: sparklines.workouts },
    { label: 'Объём', value: week.volume, unit: 'кг', delta: '+18%', note: 'за неделю', icon: 'trendingUp', spark: sparklines.volume },
  ];

  return `<section class="view view--pult" data-view="pult" aria-label="Вариант Пульт">
    <div class="page-head">
      <div>
        <p class="eyebrow">Неделя ${week.number} · ${week.label}</p>
        <h1 class="page-title">Сводка недели</h1>
      </div>
      <div class="page-head__actions">
        <div class="segmented" role="group" aria-label="Период сводки">
          <button type="button" aria-pressed="true">Неделя</button>
          <button type="button" aria-pressed="false">Месяц</button>
          <button type="button" aria-pressed="false">Всё время</button>
        </div>
        <button class="btn btn--ghost" type="button">${icon('arrowUpRight', 16)} Отчёт</button>
      </div>
    </div>

    <div class="kpi-row">
      ${kpis
        .map(
          (k, i) => `<article class="kpi" style="animation-delay:${i * 60}ms">
            <div class="kpi-top">
              <span class="kpi-label">${k.label}</span>
              <span class="kpi-icon">${icon(k.icon, 15)}</span>
            </div>
            <div class="kpi-main">
              <span class="kpi-value num js-count" data-value="${k.value}">${fmt(k.value)}${k.unit ? `<span class="unit">${k.unit}</span>` : ''}</span>
              <span class="kpi-spark">${sparkline(k.spark, { id: 'k' + i })}</span>
            </div>
            <div class="kpi-foot">
              <span class="delta">${icon('trendingUp', 12)}${k.delta}</span>
              <span class="kpi-note">${k.note}</span>
            </div>
          </article>`
        )
        .join('')}
    </div>

    <div class="pult-grid">
      <section class="card card--chart">
        <div class="card-head">
          <div>
            <h2 class="card-title">Объём тренировок</h2>
            <p class="card-sub">Сумма поднятого веса, кг</p>
          </div>
          ${chartTabs('weeks')}
        </div>
        ${chartBlock('weeks', 'pult')}
        ${chartFoot(charts.weeks)}
      </section>

      <section class="card card--goal">
        <div class="card-head">
          <div>
            <h2 class="card-title">Цель недели</h2>
            <p class="card-sub">${fmt(week.target)} кг объёма</p>
          </div>
          <span class="chip chip--accent">${Math.round((week.volume / week.target) * 100)}%</span>
        </div>
        <div class="goal-ring">
          ${ring({ pct: Math.round((week.volume / week.target) * 100), size: 154, stroke: 12, sub: 'цели', id: 'pult-goal' })}
          <p class="goal-note">Осталось <strong>${fmt(week.target - week.volume)} кг</strong><br />до цели недели</p>
        </div>
        <div class="goal-bars">
          <div class="goal-bar">
            <div class="goal-bar__row"><span>Тренировки</span><span>${week.workouts} / ${week.workoutsTarget}</span></div>
            <div class="bar"><span style="width:${(week.workouts / week.workoutsTarget) * 100}%"></span></div>
          </div>
          <div class="goal-bar">
            <div class="goal-bar__row"><span>Очки</span><span>${fmt(week.points)} / ${fmt(week.pointsTarget)}</span></div>
            <div class="bar bar--mint"><span style="width:${(week.points / week.pointsTarget) * 100}%"></span></div>
          </div>
        </div>
      </section>

      <section class="card card--muscles">
        <div class="card-head">
          <div>
            <h2 class="card-title">Группы мышц</h2>
            <p class="card-sub">${week.exercises} упражнение за неделю</p>
          </div>
          ${iconBtnMore('Все группы мышц')}
        </div>
        <div class="muscles-body">
          ${donut(muscles, { size: 148, stroke: 17 })}
          <ul class="legend">
            ${muscles
              .map(
                (m) => `<li><span class="legend-dot" style="background:${m.color}"></span>
                  <span class="legend-name">${m.name}</span>
                  <span class="legend-value">${m.pct}%</span></li>`
              )
              .join('')}
          </ul>
        </div>
      </section>

      <section class="card card--ach">
        <div class="card-head">
          <div>
            <h2 class="card-title">Достижения</h2>
            <p class="card-sub">7 из 8 открыто</p>
          </div>
          <a class="link" href="#">Все</a>
        </div>
        <div class="ach-grid">
          ${achievements
            .map(
              (a, i) => `<div class="ach ${a.unlocked ? '' : 'is-locked'}" style="animation-delay:${i * 45}ms">
                <span class="ach-icon">${icon(a.icon, 16)}</span>
                <span class="ach-title">${a.title}</span>
                ${a.unlocked ? '' : `<span class="ach-progress"><i style="width:${(a.progress / a.total) * 100}%"></i></span>`}
              </div>`
            )
            .join('')}
        </div>
      </section>

      <section class="card card--lb">
        <div class="card-head">
          <div>
            <h2 class="card-title">Рейтинг</h2>
            <p class="card-sub">По очкам · 8 участников</p>
          </div>
          <a class="link" href="#">Весь</a>
        </div>
        <ol class="lb-list">
          ${leaderboard
            .slice(0, 5)
            .map(
              (u) => `<li class="lb-row ${u.me ? 'is-me' : ''}">
                <span class="lb-rank">${u.rank}</span>
                ${avatar(u)}
                <span class="lb-name">${u.name}${u.me ? '<em>вы</em>' : ''}</span>
                <span class="lb-value">${fmt(u.value)}</span>
              </li>`
            )
            .join('')}
        </ol>
      </section>
    </div>
  </section>`;
}

/* ============================================================
   V2 — «Витрина»: крупная цифра, воздух, открытые секции
   ============================================================ */

export function vitrinaView() {
  const pct = Math.round((week.volume / week.target) * 100);

  return `<section class="view view--vitrina" data-view="vitrina" aria-label="Вариант Витрина">
    <div class="hero">
      <div class="hero-copy">
        <div class="hero-top">
          <p class="eyebrow">Неделя ${week.number} · ${week.label}</p>
          <span class="streak-badge">${icon('flame', 15)} ${user.streak} ${plural(user.streak, 'день', 'дня', 'дней')} подряд</span>
        </div>
        <div class="hero-number">
          <span class="num js-count" data-value="${week.volume}">${fmt(week.volume)}</span>
          <span class="hero-unit">кг</span>
        </div>
        <p class="hero-caption">поднято за неделю <span class="delta">${icon('trendingUp', 12)}+${week.delta}%</span></p>
        <p class="hero-lead">Три тренировки, ${week.exercises} упражнение и личный рекорд в жиме лёжа. До цели недели осталось ${fmt(week.target - week.volume)} кг.</p>
        <div class="hero-actions">
          <button class="btn btn--accent" type="button">${icon('plus', 17)} Новая тренировка</button>
          <button class="btn btn--ghost" type="button">Открыть отчёт</button>
        </div>
      </div>
      <div class="hero-aside">
        ${ring({ pct, size: 228, stroke: 14, sub: 'цели недели', id: 'v2-hero', tone: 'mint' })}
        <div class="hero-goal">
          <div><span>Очки</span><strong>${fmt(week.points)}<em> / ${fmt(week.pointsTarget)}</em></strong></div>
          <div><span>Тренировки</span><strong>${week.workouts}<em> / ${week.workoutsTarget}</em></strong></div>
        </div>
      </div>
    </div>

    <div class="vitrina-stats">
      <div class="vstat">
        <span class="vstat-label">Очки за всё время</span>
        <strong class="num js-count" data-value="${user.points}">${fmt(user.points)}</strong>
        <span class="vstat-note"><span class="delta">+142</span> за неделю</span>
      </div>
      <div class="vstat">
        <span class="vstat-label">Серия</span>
        <strong class="num js-count" data-value="${user.streak}">${user.streak}</strong>
        <span class="vstat-note">${plural(user.streak, 'день', 'дня', 'дней')} без пропусков · рекорд</span>
      </div>
      <div class="vstat">
        <span class="vstat-label">Место в рейтинге</span>
        <strong class="num">#${user.rank}</strong>
        <span class="vstat-note">из 8 участников · ${user.workouts} тренировки</span>
      </div>
      <div class="vstat">
        <span class="vstat-label">Личный рекорд</span>
        <strong class="num">82,5<span class="unit">кг</span></strong>
        <span class="vstat-note">жим лёжа · 19 октября</span>
      </div>
    </div>

    <section class="section">
      <div class="section-head">
        <div>
          <p class="eyebrow">Динамика</p>
          <h2 class="section-title">Восемь недель роста</h2>
        </div>
        ${chartTabs('weeks')}
      </div>
      ${chartBlock('weeks', 'vitrina', { width: 1400, height: 350 })}
      <div class="vitrina-chart-foot">
        <div><span>Среднее за <span data-stat="period">8 недель</span></span><strong data-stat="avg">${fmt(charts.weeks.avg)} кг</strong></div>
        <div><span>Прирост</span><strong class="is-up" data-stat="growth">+48%</strong></div>
        <div><span>Рекорд</span><strong data-stat="best">${fmt(charts.weeks.best)} кг</strong></div>
      </div>
    </section>

    <div class="vitrina-lower">
      <section class="section section--ach">
        <div class="section-head">
          <div>
            <p class="eyebrow">Коллекция</p>
            <h2 class="section-title">Достижения</h2>
          </div>
          <span class="section-meta">7 / 8</span>
        </div>
        <ul class="ach-list">
          ${achievements
            .slice(0, 5)
            .map(
              (a, i) => `<li style="animation-delay:${i * 50}ms">
                <span class="ach-list-icon ${a.unlocked ? '' : 'is-locked'}">${icon(a.icon, 18)}</span>
                <span class="ach-list-text"><strong>${a.title}</strong><em>${a.desc}</em></span>
                <span class="ach-list-date">${a.date}</span>
              </li>`
            )
            .join('')}
        </ul>
        <a class="link link--wide" href="#">Все достижения ${icon('arrowRight', 15)}</a>
      </section>

      <section class="section section--lb">
        <div class="section-head">
          <div>
            <p class="eyebrow">Сообщество</p>
            <h2 class="section-title">Рейтинг по очкам</h2>
          </div>
          <a class="link" href="#">Весь рейтинг</a>
        </div>
        <div class="podium">
          ${[1, 0, 2]
            .map((idx) => {
              const u = leaderboard[idx];
              return `<article class="podium-card podium-card--${u.rank}">
                <span class="podium-rank">${u.rank}</span>
                ${avatar(u, 'avatar--podium')}
                <span class="podium-name">${u.name}${u.me ? '<em>вы</em>' : ''}</span>
                <span class="podium-value num">${fmt(u.value)}</span>
                <span class="podium-note">${u.workouts} тренировки</span>
              </article>`;
            })
            .join('')}
        </div>
        <ol class="lb-rows">
          ${leaderboard
            .slice(3, 7)
            .map(
              (u) => `<li class="lb-row ${u.me ? 'is-me' : ''}">
                <span class="lb-rank">${u.rank}</span>
                ${avatar(u)}
                <span class="lb-name">${u.name}${u.me ? '<em>вы</em>' : ''}</span>
                <span class="lb-value">${fmt(u.value)}</span>
              </li>`
            )
            .join('')}
        </ol>
      </section>
    </div>
  </section>`;
}

/* ============================================================
   V3 — «Лента»: дневник тренировок как основа, сводка сбоку
   ============================================================ */

export function lentaView() {
  const pct = Math.round((week.volume / week.target) * 100);

  const session = (s, i) => `
    <article class="session ${s.today ? 'is-today' : ''}" style="animation-delay:${i * 70}ms">
      <div class="session-date">
        <span class="session-wd">${s.weekday}</span>
        <span class="session-day">${s.day}</span>
        <span class="session-month">${s.month}</span>
      </div>
      <div class="session-body">
        <div class="session-top">
          <h3 class="session-title">${s.title}${s.today ? '<span class="tag tag--accent">Сегодня</span>' : ''}${s.record ? '<span class="tag">Рекорд</span>' : ''}</h3>
          <span class="session-points">+${s.points}</span>
        </div>
        <p class="session-top-set">${s.top}</p>
        <div class="session-meta">
          <span>${s.exercises} ${plural(s.exercises, 'упражнение', 'упражнения', 'упражнений')}</span>
          <span>${s.minutes} мин</span>
          <span class="session-group">${s.group}</span>
        </div>
      </div>
      <div class="session-volume">
        ${s.volume ? `<strong class="num">${fmt(s.volume)}</strong><span>кг</span>` : `<strong class="num">${s.distance}</strong><span>км</span>`}
      </div>
    </article>`;

  return `<section class="view view--lenta" data-view="lenta" aria-label="Вариант Лента">
    <header class="lenta-head">
      <div>
        <p class="eyebrow">22 октября · четверг</p>
        <h1 class="lenta-title">Твоя неделя</h1>
      </div>
      <div class="lenta-head__actions">
        <span class="streak-badge">${icon('flame', 15)} ${user.streak} ${plural(user.streak, 'день', 'дня', 'дней')}</span>
        <button class="btn btn--accent" type="button">${icon('plus', 17)} Тренировка</button>
      </div>
    </header>

    <div class="week-strip">
      <div class="week-cell">
        <span>Объём недели</span>
        <strong class="num">${fmt(week.volume)}<em>кг</em></strong>
        <span class="delta">${icon('trendingUp', 12)}+${week.delta}%</span>
      </div>
      <div class="week-cell">
        <span>Тренировок</span>
        <strong class="num">${week.workouts}<em>/ ${week.workoutsTarget}</em></strong>
        <span class="week-note">${week.minutes} мин в зале</span>
      </div>
      <div class="week-cell">
        <span>Очков</span>
        <strong class="num">${fmt(week.points)}</strong>
        <span class="week-note">+${fmt(week.pointsTarget - week.points)} до цели</span>
      </div>
      <div class="week-cell week-cell--goal">
        ${ring({ pct, size: 74, stroke: 7, id: 'lenta-goal' })}
        <div class="week-goal-text">
          <span>Цель недели</span>
          <strong>${fmt(week.target - week.volume)} кг осталось</strong>
        </div>
      </div>
    </div>

    <div class="lenta-grid">
      <div class="stream">
        <div class="stream-head">
          <h2>Дневник</h2>
          <span>5 записей за две недели</span>
        </div>

        ${sessions.slice(0, 3).map(session).join('')}

        <div class="stream-event">
          <span class="stream-event-icon">${icon('medal', 16)}</span>
          <p><strong>«${achievements[4].title}»</strong> — достижение открыто</p>
          <span class="stream-event-date">19 окт</span>
        </div>

        ${sessions.slice(3).map(session).join('')}

        <button class="stream-more" type="button">Показать все ${user.workouts} тренировки ${icon('arrowRight', 15)}</button>
      </div>

      <aside class="lenta-side">
        <section class="card side-card side-goal">
          <div class="side-head">
            <h2>Цель недели</h2>
            <span class="chip chip--accent">${pct}%</span>
          </div>
          <div class="side-goal__bars">
            <div class="goal-bar">
              <div class="goal-bar__row"><span>Объём</span><span>${fmt(week.volume)} / ${fmt(week.target)}</span></div>
              <div class="bar"><span style="width:${pct}%"></span></div>
            </div>
            <div class="goal-bar">
              <div class="goal-bar__row"><span>Тренировки</span><span>${week.workouts} / ${week.workoutsTarget}</span></div>
              <div class="bar bar--mint"><span style="width:${(week.workouts / week.workoutsTarget) * 100}%"></span></div>
            </div>
          </div>
        </section>

        <section class="card side-card">
          <div class="side-head">
            <h2>Группы мышц</h2>
            <span class="side-meta">${week.exercises} упражнение</span>
          </div>
          <div class="side-muscles">
            ${donut(muscles, { size: 112, stroke: 13 })}
            <ul class="legend legend--tight">
              ${muscles
                .map(
                  (m) => `<li><span class="legend-dot" style="background:${m.color}"></span>
                    <span class="legend-name">${m.name}</span>
                    <span class="legend-value">${m.pct}%</span></li>`
                )
                .join('')}
            </ul>
          </div>
        </section>

        <section class="card side-card side-lb">
          <div class="side-head">
            <h2>Рейтинг</h2>
            <a class="link" href="#">Весь</a>
          </div>
          <ol class="lb-list lb-list--tight">
            ${leaderboard
              .slice(0, 3)
              .map(
                (u) => `<li class="lb-row">
                  <span class="lb-rank">${u.rank}</span>
                  ${avatar(u)}
                  <span class="lb-name">${u.name}</span>
                  <span class="lb-value">${fmt(u.value)}</span>
                </li>`
              )
              .join('')}
            <li class="lb-row is-me">
              <span class="lb-rank">${user.rank}</span>
              ${avatar(leaderboard[3])}
              <span class="lb-name">${user.name}<em>вы</em></span>
              <span class="lb-value">${fmt(user.points)}</span>
            </li>
          </ol>
        </section>

        <section class="card side-card side-records">
          <div class="side-head"><h2>Личные рекорды</h2></div>
          <ul class="records">
            ${records
              .map(
                (r) => `<li><span>${r.name}</span><strong>${r.value}<em>${r.unit}</em></strong><span class="records-date">${r.date}</span></li>`
              )
              .join('')}
          </ul>
        </section>
      </aside>
    </div>
  </section>`;
}
