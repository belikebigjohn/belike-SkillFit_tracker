/* Demo data — `npm run dev` must open a populated app (AGENTS.md), so the
   seed runs automatically from db.ts whenever the users table is empty.
   Deterministic PRNG: identical data on every DB reset.
   All points/achievements are computed via lib/scoring — same formulas as API. */

import type Database from "better-sqlite3";
import { hashPassword } from "@/lib/auth";
import {
  ACHIEVEMENT_CATALOG,
  type AchievementCode,
  isoAddDays,
  isoToday,
  weekStartIso,
  workoutPoints,
  type WorkoutSet,
} from "@/lib/scoring";

export const DEMO_PASSWORD = "demo1234";

interface SeedUser {
  email: string;
  name: string;
  goal: string;
  from: string;
  to: string;
  /** average workouts per week */
  weekly: number;
  /** strength multiplier for weights */
  intensity: number;
  /** how many weeks of history to generate */
  weeks: number;
  /** force a 14-day training streak ending today */
  demo?: boolean;
}

const SEED_USERS: SeedUser[] = [
  { email: "demo@forma.ru", name: "Максим Орлов", goal: "Набор массы", from: "#c8f751", to: "#6ee7b7", weekly: 3.5, intensity: 1, weeks: 52, demo: true },
  { email: "maria@forma.ru", name: "Мария Ветрова", goal: "Сила", from: "#d9ff6e", to: "#6ee7b7", weekly: 4, intensity: 1.1, weeks: 16 },
  { email: "artem@forma.ru", name: "Артём Соколов", goal: "Набор массы", from: "#8fb33a", to: "#4e7a5e", weekly: 4, intensity: 1.04, weeks: 16 },
  { email: "dana@forma.ru", name: "Дана Гареева", goal: "Выносливость", from: "#6ee7b7", to: "#2f7d63", weekly: 3.5, intensity: 0.97, weeks: 16 },
  { email: "ilya@forma.ru", name: "Илья Ковалёв", goal: "Здоровье", from: "#d9e8c7", to: "#8fb33a", weekly: 3, intensity: 0.9, weeks: 16 },
  { email: "sofya@forma.ru", name: "Софья Лебедева", goal: "Похудение", from: "#ffc857", to: "#c8f751", weekly: 3, intensity: 0.84, weeks: 16 },
  { email: "timur@forma.ru", name: "Тимур Хайруллин", goal: "Сила", from: "#9aa7a0", to: "#5c6b62", weekly: 2.5, intensity: 0.9, weeks: 16 },
  { email: "nika@forma.ru", name: "Ника Соловьёва", goal: "Выносливость", from: "#a9e02c", to: "#3f6b58", weekly: 2, intensity: 0.8, weeks: 16 },
];

interface SeedExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  mediaType: "video" | "animation";
  mediaUrl: string;
  description: string;
}

/* Catalog mirrors mock/data.ts (Module A design stand). */
const EXERCISES: SeedExercise[] = [
  { id: "e-squat", name: "Приседания со штангой", muscleGroup: "Ноги", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=barbell+squat+form", description: "Базовое движение для ног и ягодиц. Пятки прижаты, спина прямая, колено по направлению носка." },
  { id: "e-press", name: "Жим ногами в тренажёре", muscleGroup: "Ноги", equipment: "Тренажёр", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=leg+press", description: "Мощная нагрузка на квадрицепс без осевой нагрузки на позвоночник." },
  { id: "e-deadlift", name: "Становая тяга", muscleGroup: "Спина", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=deadlift+form", description: "Самое объёмное движение: спина, ноги, хват. Снимайте штангу с середины стопы." },
  { id: "e-pullup", name: "Подтягивания", muscleGroup: "Спина", equipment: "Свой вес", mediaType: "animation", mediaUrl: "https://www.youtube.com/results?search_query=pull+up+technique", description: "Вертикальная тяга для широчайших. Полный диапазон — до параллели и выше." },
  { id: "e-row", name: "Тяга штанги в наклоне", muscleGroup: "Спина", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=bent+over+row", description: "Толчковое движение для толщины спины. Корпус 45°, лопатки сводите в верхней точке." },
  { id: "e-hyper", name: "Гиперэкстензия", muscleGroup: "Спина", equipment: "Римский стул", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=back+extension", description: "Укрепление разгибателей спины и бицепса бедра. Не переразгибайте вверху." },
  { id: "e-bench", name: "Жим лёжа", muscleGroup: "Грудь", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=bench+press+form", description: "Главное жимовое движение для груди и трицепса. Лопатки сведены, лёгкий прогиб." },
  { id: "e-incline", name: "Жим гантелей на наклонной", muscleGroup: "Грудь", equipment: "Гантели", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=incline+dumbbell+press", description: "Акцент на верх груди. Угол скамьи 30–45°." },
  { id: "e-fly", name: "Разводка гантелей лёжа", muscleGroup: "Грудь", equipment: "Гантели", mediaType: "animation", mediaUrl: "https://www.youtube.com/results?search_query=dumbbell+fly", description: "Изоляция груди через растяжение. Локти чуть согнуты, движение медленное." },
  { id: "e-dip", name: "Отжимания на брусьях", muscleGroup: "Грудь", equipment: "Свой вес", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=parallel+bar+dips", description: "Корпус с наклоном — акцент на грудь, вертикальный — на трицепс." },
  { id: "e-ohp", name: "Жим гантелей сидя", muscleGroup: "Плечи", equipment: "Гантели", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=seated+dumbbell+press", description: "Базовый жим для дельт. Спинка скамьи 85°, не прогибайте поясницу." },
  { id: "e-lateral", name: "Махи гантелей в стороны", muscleGroup: "Плечи", equipment: "Гантели", mediaType: "animation", mediaUrl: "https://www.youtube.com/results?search_query=lateral+raise", description: "Средняя дельта — ширина плеч. Вес меньше, чем хочется, техника важнее." },
  { id: "e-facepull", name: "Тяга к лицу на блоке", muscleGroup: "Плечи", equipment: "Блок", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=face+pull", description: "Задняя дельта и ротаторы — здоровье плеча. Тяните к уровню глаз." },
  { id: "e-curl", name: "Подъём штанги на бицепс", muscleGroup: "Руки", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=barbell+curl", description: "Классика для бицепса. Локти прижаты, корпус не раскачивайте." },
  { id: "e-hammer", name: "Молотки с гантелями", muscleGroup: "Руки", equipment: "Гантели", mediaType: "animation", mediaUrl: "https://www.youtube.com/results?search_query=hammer+curl", description: "Бицепс и брахиалис — рука в толщину. Нейтральный хват." },
  { id: "e-pushdown", name: "Разгибания на блоке", muscleGroup: "Руки", equipment: "Блок", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=triceps+pushdown", description: "Изоляция трицепса. Локти неподвижны, разгибайте до полного выпрямления." },
  { id: "e-kickback", name: "Французский жим", muscleGroup: "Руки", equipment: "Штанга", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=close+grip+bench+press", description: "Длинная головка трицепса. Узкий хват, локти идут вдоль корпуса." },
  { id: "e-calf", name: "Подъёмы на носки стоя", muscleGroup: "Ноги", equipment: "Тренажёр", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=standing+calf+raise", description: "Икры любят полную амплитуду и паузу в нижней точке." },
  { id: "e-run", name: "Бег на улице", muscleGroup: "Кардио", equipment: "Кроссовки", mediaType: "video", mediaUrl: "https://www.youtube.com/results?search_query=running+cadence+tips", description: "Ровный темп и каденс 160–180 шагов в минуту берегут колени." },
];

const BODYWEIGHT = new Set(["e-pullup", "e-dip"]);

/** starting working weights (kg); progress linearly ×(0.72…1.05) over history */
const BASE_WEIGHT: Record<string, number> = {
  "e-squat": 70, "e-press": 150, "e-deadlift": 100, "e-pullup": 0, "e-row": 55,
  "e-hyper": 15, "e-bench": 62.5, "e-incline": 22, "e-fly": 12, "e-dip": 0,
  "e-ohp": 20, "e-lateral": 8, "e-facepull": 17.5, "e-curl": 22.5, "e-hammer": 12,
  "e-pushdown": 15, "e-kickback": 22.5, "e-calf": 45, "e-run": 0,
};

interface Theme {
  group: string;
  title: string;
  main: string[];
  extra: string[];
}

const THEMES: Theme[] = [
  { group: "Грудь", title: "Грудь и трицепс", main: ["e-bench", "e-incline", "e-fly", "e-dip"], extra: ["e-pushdown", "e-kickback"] },
  { group: "Ноги", title: "Ноги и ягодицы", main: ["e-squat", "e-press", "e-calf"], extra: ["e-hyper"] },
  { group: "Плечи", title: "Плечи и руки", main: ["e-ohp", "e-lateral", "e-facepull"], extra: ["e-curl", "e-hammer"] },
  { group: "Спина", title: "Спина и бицепс", main: ["e-deadlift", "e-pullup", "e-row"], extra: ["e-curl", "e-hammer"] },
];

const REPS = [[12, 10, 10], [10, 8, 8], [8, 8, 6], [15, 12, 10], [10, 10, 8], [12, 12, 10, 8]];
const BODY_REPS = [[8, 7, 6], [10, 8, 8], [6, 5, 4]];

const NOTES = [
  "Рабочие подходышли легко, дыхание не сбивалось.",
  "Забрала себя через «не хочу» — в зале стало легче.",
  "Добавила рабочий вес, техника не пострадала.",
  "Отдых между подходами держала короче обычного.",
  "Записала подходы сразу после зала, пока не забыла.",
];

/* ---------- helpers ---------- */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round25 = (n: number) => Math.max(2.5, Math.round(n / 2.5) * 2.5);

interface GenItem {
  id: string;
  exerciseId: string;
  order: number;
  sets: WorkoutSet[];
  durationSec: number | null;
  distanceM: number | null;
}

interface GenWorkout {
  id: string;
  day: string;
  title: string;
  group: string;
  notes: string;
  minutes: number;
  volumeKg: number;
  points: number;
  items: GenItem[];
}

/* ---------- generation ---------- */

function buildDays(rand: () => number, u: SeedUser): string[] {
  const today = isoToday();
  const monday = weekStartIso(today);
  const days = new Set<string>();
  for (let w = u.weeks - 1; w >= 0; w--) {
    const ws = isoAddDays(monday, -7 * w);
    // recent quarter is denser so charts look alive; older weeks taper
    const recency = 1 - w / u.weeks;
    const freq = u.weekly * (0.55 + 0.45 * recency);
    for (let k = 0; k < 7; k++) {
      const day = isoAddDays(ws, k);
      if (day > today) continue;
      if (rand() < freq / 7) days.add(day);
    }
  }
  if (u.demo) {
    for (let d = 13; d >= 0; d--) days.add(isoAddDays(today, -d));
  }
  return [...days].sort();
}

function buildWorkout(
  rand: () => number,
  u: SeedUser,
  ui: number,
  index: number,
  total: number,
  day: string,
): GenWorkout {
  const id = `w-${ui}-${index}`;
  const t = total > 1 ? index / (total - 1) : 1; // 0 = oldest, 1 = latest
  const items: GenItem[] = [];
  let group: string;
  let title: string;
  let minutes: number;

  if (rand() < 0.1) {
    group = "Кардио";
    title = "Бег в парке";
    minutes = Math.round(28 + rand() * 14);
    items.push({
      id: `${id}-1`,
      exerciseId: "e-run",
      order: 1,
      sets: [],
      durationSec: minutes * 60,
      distanceM: Math.round((3800 + rand() * 2400) / 100) * 100,
    });
  } else {
    const theme = THEMES[index % THEMES.length];
    group = theme.group;
    title = theme.title;
    const mains = 2 + Math.floor(rand() * (theme.main.length - 1));
    const picked = [...theme.main.slice(0, mains)];
    const extras = theme.extra.length > 0 && rand() < 0.85 ? 1 + Math.floor(rand() * theme.extra.length) : 0;
    picked.push(...theme.extra.slice(0, extras));
    picked.forEach((exId, i) => {
      const pattern = BODYWEIGHT.has(exId)
        ? BODY_REPS[Math.floor(rand() * BODY_REPS.length)]
        : REPS[Math.floor(rand() * REPS.length)];
      const base = BASE_WEIGHT[exId] ?? 10;
      const weight = BODYWEIGHT.has(exId)
        ? 0
        : round25(base * u.intensity * (0.72 + 0.33 * t) * (0.94 + rand() * 0.12));
      items.push({
        id: `${id}-${i + 1}`,
        exerciseId: exId,
        order: i + 1,
        sets: pattern.map((reps) => ({ reps, weightKg: weight })),
        durationSec: null,
        distanceM: null,
      });
    });
    minutes = Math.round(34 + items.length * 5 + rand() * 10);
  }

  const volumeKg = Math.round(
    items.reduce((sum, it) => sum + it.sets.reduce((s, x) => s + x.reps * x.weightKg, 0), 0),
  );

  return {
    id,
    day,
    title,
    group,
    notes: rand() < 0.45 ? "" : NOTES[Math.floor(rand() * NOTES.length)],
    minutes,
    volumeKg,
    points: 0,
    items,
  };
}

/** replay unlock dates chronologically; same predicates as the live app */
function achievementDates(workouts: GenWorkout[]): Map<AchievementCode, string> {
  const res = new Map<AchievementCode, string>();
  const unlock = (code: AchievementCode, day: string) => {
    if (!res.has(code)) res.set(code, day);
  };
  const weekly = new Map<string, number>();
  const groups = new Set<string>();
  const days = new Set<string>();
  let count = 0;
  let cumPoints = 0;
  let run = 0;
  let prevDay: string | null = null;

  for (const w of workouts) {
    count += 1;
    days.add(w.day);
    cumPoints += w.points;
    run = prevDay !== null && isoAddDays(prevDay, 1) === w.day ? run + 1 : 1;
    prevDay = w.day;
    const ws = weekStartIso(w.day);
    const weekVol = (weekly.get(ws) ?? 0) + w.volumeKg;
    weekly.set(ws, weekVol);
    if (w.group !== "Кардио") groups.add(w.group);

    if (count >= 1) unlock("first", w.day);
    if (count >= 5) unlock("five", w.day);
    if (count >= 10) unlock("ten", w.day);
    if (run >= 7) unlock("streak7", w.day);
    if (run >= 30) unlock("streak30", w.day);
    if (weekVol >= 10000) unlock("tons10", w.day);
    if (groups.size >= 3) unlock("groups3", w.day);
    if (cumPoints >= 1000) unlock("points1k", w.day);
  }
  // days is referenced for clarity of intent (streak chains use `run`)
  void days;
  return res;
}

/* ---------- seeding ---------- */

export function seedDatabase(raw: Database.Database): void {
  const now = new Date().toISOString();

  const insUser = raw.prepare(
    `INSERT INTO users (id, email, password_hash, name, goal, avatar_from, avatar_to, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insExercise = raw.prepare(
    `INSERT OR IGNORE INTO exercises (id, name, muscle_group, equipment, description, media_url, media_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const insAchievement = raw.prepare(
    `INSERT OR IGNORE INTO achievements (id, code, title, description, icon) VALUES (?, ?, ?, ?, ?)`,
  );
  const insWorkout = raw.prepare(
    `INSERT INTO workouts (id, user_id, title, performed_at, notes, "group", minutes, volume_kg, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insItem = raw.prepare(
    `INSERT INTO workout_exercises (id, workout_id, exercise_id, sort, sets_json, duration_sec, distance_m, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
  );
  const insEvent = raw.prepare(
    `INSERT INTO point_events (id, user_id, amount, reason, workout_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insUnlock = raw.prepare(
    `INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)`,
  );

  raw.transaction(() => {
    for (const e of EXERCISES) {
      insExercise.run(e.id, e.name, e.muscleGroup, e.equipment, e.description, e.mediaUrl, e.mediaType);
    }
    for (const a of ACHIEVEMENT_CATALOG) {
      insAchievement.run(a.code, a.code, a.title, a.description, a.icon);
    }

    SEED_USERS.forEach((u, ui) => {
      const userId = `u-${ui}`;
      insUser.run(userId, u.email, hashPassword(DEMO_PASSWORD), u.name, u.goal, u.from, u.to, now);

      const rand = mulberry32(1000 + ui * 7919);
      const days = buildDays(rand, u);
      const workouts = days.map((day, i) => buildWorkout(rand, u, ui, i, days.length, day));

      // points pass: streak = consecutive chain ending at this workout's day
      let run = 0;
      let prevDay: string | null = null;
      for (const w of workouts) {
        run = prevDay !== null && isoAddDays(prevDay, 1) === w.day ? run + 1 : 1;
        prevDay = w.day;
        w.points = workoutPoints({ volumeKg: w.volumeKg, minutes: w.minutes, streak: run });
      }

      for (const w of workouts) {
        insWorkout.run(w.id, userId, w.title, w.day, w.notes, w.group, w.minutes, w.volumeKg, `${w.day}T09:00:00.000Z`);
        for (const it of w.items) {
          insItem.run(it.id, w.id, it.exerciseId, it.order, JSON.stringify(it.sets), it.durationSec, it.distanceM);
        }
        if (w.points > 0) {
          insEvent.run(`pe-${w.id}`, userId, w.points, `Тренировка «${w.title}»`, w.id, `${w.day}T09:00:00.000Z`);
        }
      }

      for (const [code, day] of achievementDates(workouts)) {
        insUnlock.run(userId, code, day);
      }
    });
  })();
}
