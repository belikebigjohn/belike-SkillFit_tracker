/* Demo data — same shapes the REST API will return. */

export const user = {
  name: 'Максим Орлов',
  initials: 'МО',
  goal: 'Набор массы',
  streak: 12,
  points: 2480,
  workouts: 34,
  rank: 4,
};

export const week = {
  label: '19–25 октября',
  number: 13,
  volume: 12480,
  target: 15000,
  points: 636,
  pointsTarget: 750,
  workouts: 3,
  workoutsTarget: 4,
  minutes: 161,
  delta: 18,
  exercises: 41,
};

export const charts = {
  weeks: {
    label: '8 недель',
    labels: ['1 сен', '8 сен', '15 сен', '22 сен', '29 сен', '6 окт', '13 окт', '20 окт'],
    values: [8400, 9200, 8800, 10400, 11100, 9900, 10800, 12480],
    avg: 9800,
    best: 12480,
  },
  months: {
    label: '6 месяцев',
    labels: ['май', 'июн', 'июл', 'авг', 'сен', 'окт'],
    values: [26400, 31200, 28800, 34500, 38900, 42800],
    avg: 33767,
    best: 42800,
  },
  year: {
    label: 'Год',
    labels: ['ноя', 'дек', 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт'],
    values: [21800, 19400, 24600, 27300, 25100, 29800, 26400, 31200, 28800, 34500, 38900, 42800],
    avg: 29242,
    best: 42800,
  },
};

export const muscles = [
  { name: 'Ноги', pct: 28, color: '#c8f751' },
  { name: 'Спина', pct: 24, color: '#6ee7b7' },
  { name: 'Грудь', pct: 21, color: '#8fb33a' },
  { name: 'Плечи', pct: 15, color: '#4e7a5e' },
  { name: 'Руки', pct: 12, color: '#2f4038' },
];

export const achievements = [
  { code: 'first', title: 'Первый шаг', desc: 'Первая тренировка', icon: 'zap', date: '2 сен', unlocked: true },
  { code: 'five', title: 'Пять тренировок', desc: '5 занятий в журнале', icon: 'check', date: '18 сен', unlocked: true },
  { code: 'ten', title: 'Десятка', desc: '10 тренировок', icon: 'layers', date: '6 окт', unlocked: true },
  { code: 'streak7', title: 'Серия 7 дней', desc: 'Неделя без пропусков', icon: 'flame', date: '15 окт', unlocked: true },
  { code: 'tons10', title: '10 тонн', desc: '10 000 кг за неделю', icon: 'medal', date: '19 окт', unlocked: true },
  { code: 'groups3', title: 'Три группы', desc: 'Грудь, спина и ноги', icon: 'target', date: '19 окт', unlocked: true },
  { code: 'points1k', title: '1000 очков', desc: 'Первая тысяча', icon: 'trophy', date: '20 окт', unlocked: true },
  { code: 'streak30', title: 'Серия 30 дней', desc: 'Ещё 18 дней', icon: 'lock', date: '', unlocked: false, progress: 12, total: 30 },
];

export const leaderboard = [
  { rank: 1, name: 'Мария Ветрова', initials: 'МВ', value: 3120, workouts: 41, from: '#d9ff6e', to: '#6ee7b7', me: false },
  { rank: 2, name: 'Артём Соколов', initials: 'АС', value: 2940, workouts: 38, from: '#8fb33a', to: '#4e7a5e', me: false },
  { rank: 3, name: 'Дана Гареева', initials: 'ДГ', value: 2610, workouts: 36, from: '#6ee7b7', to: '#2f7d63', me: false },
  { rank: 4, name: 'Максим Орлов', initials: 'МО', value: 2480, workouts: 34, from: '#c8f751', to: '#6ee7b7', me: true },
  { rank: 5, name: 'Илья Ковалёв', initials: 'ИК', value: 2210, workouts: 31, from: '#d9e8c7', to: '#8fb33a', me: false },
  { rank: 6, name: 'Софья Лебедева', initials: 'СЛ', value: 2040, workouts: 29, from: '#ffc857', to: '#c8f751', me: false },
  { rank: 7, name: 'Тимур Хайруллин', initials: 'ТХ', value: 1890, workouts: 27, from: '#9aa7a0', to: '#5c6b62', me: false },
  { rank: 8, name: 'Ника Соловьёва', initials: 'НС', value: 1720, workouts: 24, from: '#a9e02c', to: '#3f6b58', me: false },
];

export const sessions = [
  {
    id: 3,
    weekday: 'ЧТ',
    day: '22',
    month: 'окт',
    date: '22 октября',
    title: 'Ноги и ягодицы',
    group: 'Ноги',
    exercises: 4,
    minutes: 41,
    volume: 3500,
    points: 62,
    top: 'Приседания со штангой · 80 кг × 8',
    today: true,
  },
  {
    id: 2,
    weekday: 'СР',
    day: '21',
    month: 'окт',
    date: '21 октября',
    title: 'Спина и бицепс',
    group: 'Спина',
    exercises: 5,
    minutes: 58,
    volume: 4860,
    points: 78,
    top: 'Становая тяга · 110 кг × 5',
    today: false,
  },
  {
    id: 1,
    weekday: 'ПН',
    day: '19',
    month: 'окт',
    date: '19 октября',
    title: 'Грудь и трицепс',
    group: 'Грудь',
    exercises: 6,
    minutes: 62,
    volume: 4120,
    points: 70,
    top: 'Жим лёжа · 82,5 кг × 6 · рекорд',
    today: false,
    record: true,
  },
  {
    id: 4,
    weekday: 'ВС',
    day: '16',
    month: 'окт',
    date: '16 октября',
    title: 'Бег в парке',
    group: 'Кардио',
    exercises: 1,
    minutes: 34,
    volume: 0,
    distance: 5,
    points: 34,
    top: '5 км · средний темп 6:48',
    today: false,
  },
  {
    id: 5,
    weekday: 'ПТ',
    day: '14',
    month: 'окт',
    date: '14 октября',
    title: 'Плечи и руки',
    group: 'Плечи',
    exercises: 5,
    minutes: 48,
    volume: 3240,
    points: 58,
    top: 'Жим гантелей сидя · 22 кг × 10',
    today: false,
  },
];

export const records = [
  { name: 'Жим лёжа', value: '82,5', unit: 'кг', date: '19 окт' },
  { name: 'Становая тяга', value: '120', unit: 'кг', date: '21 сен' },
  { name: 'Приседания', value: '100', unit: 'кг', date: '5 окт' },
];

export const sparklines = {
  points: [12, 18, 15, 24, 22, 30, 26, 34],
  streak: [4, 4, 5, 5, 6, 7, 7, 8],
  workouts: [8, 10, 9, 12, 11, 13, 12, 14],
  volume: [22, 26, 24, 30, 28, 33, 31, 36],
};
