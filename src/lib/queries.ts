/* Server-only read side: aggregates DB rows into the view models from types.ts.
   Only route handlers import this — better-sqlite3 must never reach a client
   bundle. Reads use prepared raw SQL (aggregation is easier and faster here);
   writes go through typed drizzle in mutations.ts. */

import {
  ACHIEVEMENT_CATALOG,
  type AchievementCode,
  achievementProgress,
  achievementTarget,
  currentStreak,
  isAchievementUnlocked,
  isoAddDays,
  isoToday,
  itemVolume,
  weekStartIso,
  bestStreak,
  WEEK_GOALS,
  type AchievementStats,
  type WorkoutSet,
} from "@/lib/scoring";
import { getRaw } from "@/lib/db";
import type {
  Achievement,
  AchievementUnlock,
  ChartSeries,
  Exercise,
  LeaderMetric,
  LeaderRow,
  MuscleGroup,
  MuscleSlice,
  PersonalRecord,
  Session,
  User,
  WeekSummary,
  WorkoutDetail,
  WorkoutItem,
} from "@/lib/types";

/** Newly unlocked achievements returned by mutation endpoints (for toasts). */
export type UnlockInfo = AchievementUnlock;

/** Mon–Sun of the current week: did the user train on that day? (rail streak dots) */
export function weekActivity(userId: string): boolean[] {
  const monday = weekStartIso(isoToday());
  const days = daySet(userId);
  return Array.from({ length: 7 }, (_, i) => days.has(isoAddDays(monday, i)));
}

/** Avatar gradient stored on the user row (seed or registration). */
export function userAvatarColors(userId: string): { from: string; to: string } {
  const r = getRaw()
    .prepare('SELECT avatar_from AS "from", avatar_to AS "to" FROM users WHERE id = ?')
    .get(userId) as { from: string; to: string } | undefined;
  return r ?? pickAvatar(userId);
}

/* ---------- RU date formatting ---------- */

const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

const parts = (iso: string) => ({
  y: Number(iso.slice(0, 4)),
  m: Number(iso.slice(5, 7)),
  d: Number(iso.slice(8, 10)),
});

function weekdayShort(iso: string): string {
  const s = new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(
    new Date(`${iso}T12:00:00`),
  );
  return s.replace(".", "").toUpperCase();
}

const dateLong = (iso: string) => {
  const { d, m } = parts(iso);
  return `${d} ${MONTHS_GEN[m - 1]}`;
};

const dateShort = (iso: string) => {
  const { d, m } = parts(iso);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
};

/** 82.5 → "82,5"; 12480 → "12 480" is applied by UI formatNum; this keeps one decimal. */
export function kgLabel(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Deterministic gradient for newly registered users. */
const AVATAR_PAIRS: Array<[string, string]> = [
  ["#a3f900", "#64d2ff"],
  ["#bf5af2", "#0a84ff"],
  ["#0a84ff", "#64d2ff"],
  ["#ff9f0a", "#ff375f"],
  ["#64d2ff", "#a3f900"],
  ["#ff375f", "#bf5af2"],
];

export function pickAvatar(seed: string): { from: string; to: string } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const [from, to] = AVATAR_PAIRS[h % AVATAR_PAIRS.length];
  return { from, to };
}

const MUSCLE_COLORS: Record<string, string> = {
  Ноги: "#a3f900",
  Спина: "#64d2ff",
  Грудь: "#bf5af2",
  Плечи: "#0a84ff",
  Руки: "#ff375f",
  Кардио: "#ff9f0a",
};

/* ---------- row loaders ---------- */

export interface WorkoutRow {
  id: string;
  title: string;
  performedAt: string;
  notes: string;
  group: string;
  minutes: number;
  volumeKg: number;
}

const LOAD_WORKOUTS = () =>
  getRaw().prepare(
    `SELECT id, title, performed_at AS performedAt, notes, "group" AS "group",
            minutes, volume_kg AS volumeKg
     FROM workouts WHERE user_id = ?
     ORDER BY performed_at DESC, created_at DESC`,
  );

export function loadWorkouts(userId: string): WorkoutRow[] {
  return LOAD_WORKOUTS().all(userId) as WorkoutRow[];
}

export function getOwnedWorkout(userId: string, id: string): WorkoutRow | null {
  const row = getRaw()
    .prepare(
      `SELECT id, title, performed_at AS performedAt, notes, "group" AS "group",
              minutes, volume_kg AS volumeKg
       FROM workouts WHERE id = ? AND user_id = ?`,
    )
    .get(id, userId) as WorkoutRow | undefined;
  return row ?? null;
}

interface ItemRow {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  sets: WorkoutSet[];
  durationSec: number | null;
  distanceM: number | null;
  name: string;
  muscleGroup: string;
}

function parseSets(json: string): WorkoutSet[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function mapItem(r: {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  setsJson: string;
  durationSec: number | null;
  distanceM: number | null;
  name: string;
  muscleGroup: string;
}): ItemRow {
  return {
    id: r.id,
    workoutId: r.workoutId,
    exerciseId: r.exerciseId,
    order: r.order,
    sets: parseSets(r.setsJson),
    durationSec: r.durationSec,
    distanceM: r.distanceM,
    name: r.name,
    muscleGroup: r.muscleGroup,
  };
}

function loadItems(userId: string): ItemRow[] {
  const rows = getRaw()
    .prepare(
      `SELECT we.id, we.workout_id AS workoutId, we.exercise_id AS exerciseId,
              we.sort AS "order", we.sets_json AS setsJson, we.duration_sec AS durationSec,
              we.distance_m AS distanceM, e.name, e.muscle_group AS muscleGroup
       FROM workout_exercises we
       JOIN exercises e ON e.id = we.exercise_id
       JOIN workouts w ON w.id = we.workout_id
       WHERE w.user_id = ?
       ORDER BY we.sort`,
    )
    .all(userId) as Parameters<typeof mapItem>[0][];
  return rows.map(mapItem);
}

function itemsByWorkout(items: ItemRow[]): Map<string, ItemRow[]> {
  const map = new Map<string, ItemRow[]>();
  for (const it of items) {
    const list = map.get(it.workoutId);
    if (list) list.push(it);
    else map.set(it.workoutId, [it]);
  }
  return map;
}

function loadPointsByWorkout(userId: string): Map<string, number> {
  const rows = getRaw()
    .prepare(
      `SELECT workout_id AS workoutId, SUM(amount) AS points
       FROM point_events WHERE user_id = ? AND workout_id IS NOT NULL
       GROUP BY workout_id`,
    )
    .all(userId) as { workoutId: string; points: number }[];
  return new Map(rows.map((r) => [r.workoutId, r.points]));
}

function sumPoints(userId: string): number {
  const { p } = getRaw()
    .prepare("SELECT COALESCE(SUM(amount), 0) AS p FROM point_events WHERE user_id = ?")
    .get(userId) as { p: number };
  return p;
}

function daySet(userId: string): Set<string> {
  const rows = getRaw()
    .prepare("SELECT performed_at AS d FROM workouts WHERE user_id = ?")
    .all(userId) as { d: string }[];
  return new Set(rows.map((r) => r.d));
}

/* ---------- view builders ---------- */

export function buildUserView(userId: string): User | null {
  const u = getRaw()
    .prepare("SELECT name, goal FROM users WHERE id = ?")
    .get(userId) as { name: string; goal: string } | undefined;
  if (!u) return null;

  const points = sumPoints(userId);
  const { workouts } = getRaw()
    .prepare("SELECT COUNT(*) AS workouts FROM workouts WHERE user_id = ?")
    .get(userId) as { workouts: number };
  const streak = currentStreak(daySet(userId));

  const ranked = getRaw()
    .prepare(
      "SELECT user_id AS id FROM point_events GROUP BY user_id ORDER BY SUM(amount) DESC",
    )
    .all() as { id: string }[];
  const idx = ranked.findIndex((r) => r.id === userId);
  const rank = idx === -1 ? ranked.length + 1 : idx + 1;

  return {
    name: u.name,
    initials: initials(u.name),
    goal: u.goal,
    streak,
    points,
    workouts,
    rank,
  };
}

/** "5 км · средний темп 6:48" or "Жим лёжа · 82,5 кг × 6". */
function topLine(items: ItemRow[]): string {
  const cardio = items.find((i) => (i.distanceM ?? 0) > 0 && itemVolume(i.sets) === 0);
  if (cardio && items.every((i) => itemVolume(i.sets) === 0)) {
    const km = (cardio.distanceM ?? 0) / 1000;
    let pace = "";
    if (cardio.durationSec && cardio.durationSec > 0) {
      const perKm = cardio.durationSec / km;
      pace = ` · средний темп ${Math.floor(perKm / 60)}:${String(Math.round(perKm % 60)).padStart(2, "0")}`;
    }
    return `${kgLabel(Math.round(km * 10) / 10)} км${pace}`;
  }
  let best: { name: string; weightKg: number; reps: number } | null = null;
  for (const it of items) {
    for (const s of it.sets) {
      if (s.weightKg > 0 && (!best || s.weightKg > best.weightKg)) {
        best = { name: it.name, weightKg: s.weightKg, reps: s.reps };
      }
    }
  }
  if (best) return `${best.name} · ${kgLabel(best.weightKg)} кг × ${best.reps}`;
  return items.length > 0 ? "Работа с собственным весом" : "";
}

export function buildSessions(userId: string): Session[] {
  const workouts = loadWorkouts(userId);
  const items = loadItems(userId);
  const byWorkout = itemsByWorkout(items);
  const points = loadPointsByWorkout(userId);

  // a workout is `record` when it first sets an all-time max weight for any exercise
  const allTime = new Map<string, number>();
  const recordIds = new Set<string>();
  for (const w of [...workouts].reverse()) {
    for (const it of byWorkout.get(w.id) ?? []) {
      for (const s of it.sets) {
        if (s.weightKg <= 0) continue;
        const prev = allTime.get(it.exerciseId) ?? 0;
        if (s.weightKg > prev) {
          allTime.set(it.exerciseId, s.weightKg);
          recordIds.add(w.id);
        }
      }
    }
  }

  const today = isoToday();
  return workouts.map((w) => {
    const list = byWorkout.get(w.id) ?? [];
    const { d, m } = parts(w.performedAt);
    return {
      id: w.id,
      weekday: weekdayShort(w.performedAt),
      day: String(d),
      month: MONTHS_SHORT[m - 1],
      date: dateLong(w.performedAt),
      title: w.title,
      group: w.group,
      exercises: list.length,
      minutes: w.minutes,
      volumeKg: Math.round(w.volumeKg),
      points: points.get(w.id) ?? 0,
      top: topLine(list),
      today: w.performedAt === today,
      ...(recordIds.has(w.id) ? { record: true } : {}),
    } satisfies Session;
  });
}

export function buildWorkoutDetail(userId: string, workoutId: string): WorkoutDetail | null {
  const w = getOwnedWorkout(userId, workoutId);
  if (!w) return null;
  const rows = getRaw()
    .prepare(
      `SELECT we.id, we.workout_id AS workoutId, we.exercise_id AS exerciseId,
              we.sort AS "order", we.sets_json AS setsJson, we.duration_sec AS durationSec,
              we.distance_m AS distanceM, e.name, e.muscle_group AS muscleGroup
       FROM workout_exercises we
       JOIN exercises e ON e.id = we.exercise_id
       WHERE we.workout_id = ?
       ORDER BY we.sort`,
    )
    .all(workoutId) as Parameters<typeof mapItem>[0][];
  const items = rows.map(mapItem);

  const points = loadPointsByWorkout(userId).get(workoutId) ?? 0;
  let group = w.group;
  if (!group && items.length > 0) {
    const byGroup = new Map<string, number>();
    for (const it of items) byGroup.set(it.muscleGroup, (byGroup.get(it.muscleGroup) ?? 0) + itemVolume(it.sets));
    group = [...byGroup.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  return {
    id: w.id,
    title: w.title,
    performedAt: w.performedAt,
    notes: w.notes,
    group,
    minutes: w.minutes,
    volumeKg: Math.round(w.volumeKg),
    points,
    items: items.map<WorkoutItem>((it) => ({
      id: it.id,
      exerciseId: it.exerciseId,
      name: it.name,
      order: it.order,
      sets: it.sets,
      durationSec: it.durationSec,
      distanceM: it.distanceM,
    })),
  };
}

const addMonths = (key: string, delta: number): string => {
  const d = new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1 + delta, 15);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function series(label: string, labels: string[], values: number[]): ChartSeries {
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    label,
    labels,
    values,
    avg: Math.round(sum / Math.max(values.length, 1)),
    best: values.length ? Math.max(...values) : 0,
  };
}

export interface StatsView {
  week: WeekSummary;
  charts: Record<"weeks" | "months" | "year", ChartSeries>;
  muscles: MuscleSlice[];
  sparklines: Record<string, number[]>;
}

export function buildStats(userId: string): StatsView {
  const today = isoToday();
  const monday = weekStartIso(today);
  const workouts = loadWorkouts(userId);
  const items = loadItems(userId);
  const byWorkout = itemsByWorkout(items);
  const pointsBy = loadPointsByWorkout(userId);

  const inRange = (day: string, from: string, to: string) => day >= from && day <= to;
  const weekAgg = (from: string, to: string) => {
    let volumeKg = 0;
    let points = 0;
    let count = 0;
    let minutes = 0;
    let exercises = 0;
    let runM = 0;
    for (const w of workouts) {
      if (!inRange(w.performedAt, from, to)) continue;
      count += 1;
      volumeKg += w.volumeKg;
      minutes += w.minutes;
      points += pointsBy.get(w.id) ?? 0;
      exercises += byWorkout.get(w.id)?.length ?? 0;
      for (const it of byWorkout.get(w.id) ?? []) {
        if (it.exerciseId === "e-run") runM += it.distanceM ?? 0;
      }
    }
    return { volumeKg: Math.round(volumeKg), points, count, minutes, exercises, runM: Math.round(runM) };
  };

  const prevMonday = isoAddDays(monday, -7);
  const week = weekAgg(monday, isoAddDays(monday, 6));
  const prev = weekAgg(prevMonday, isoAddDays(monday, -1));
  const deltaPct = prev.volumeKg > 0 ? Math.round(((week.volumeKg - prev.volumeKg) / prev.volumeKg) * 100) : 0;

  const mon = parts(monday);
  const sun = parts(isoAddDays(monday, 6));
  const label =
    mon.m === sun.m
      ? `${mon.d}–${sun.d} ${MONTHS_GEN[sun.m - 1]}`
      : `${mon.d} ${MONTHS_GEN[mon.m - 1]} – ${sun.d} ${MONTHS_GEN[sun.m - 1]}`;

  /* charts */
  const weekBuckets: { start: string; value: number }[] = [];
  for (let k = 7; k >= 0; k--) {
    const ws = isoAddDays(monday, -7 * k);
    let v = 0;
    for (const w of workouts) if (weekStartIso(w.performedAt) === ws) v += w.volumeKg;
    weekBuckets.push({ start: ws, value: Math.round(v) });
  }
  const weeks = series(
    "8 недель",
    weekBuckets.map((b) => dateShort(b.start)),
    weekBuckets.map((b) => b.value),
  );

  const monthAgg = (n: number) => {
    const cur = `${today.slice(0, 7)}`;
    const keys: string[] = [];
    for (let k = n - 1; k >= 0; k--) keys.push(addMonths(cur, -k));
    const values = keys.map(() => 0);
    for (const w of workouts) {
      const idx = keys.indexOf(w.performedAt.slice(0, 7));
      if (idx >= 0) values[idx] += w.volumeKg;
    }
    return { keys, values: values.map((v) => Math.round(v)) };
  };
  const m6 = monthAgg(6);
  const months = series(
    "6 месяцев",
    m6.keys.map((k) => MONTHS_SHORT[Number(k.slice(5, 7)) - 1]),
    m6.values,
  );
  const m12 = monthAgg(12);
  const year = series(
    "Год",
    m12.keys.map((k) => MONTHS_SHORT[Number(k.slice(5, 7)) - 1]),
    m12.values,
  );

  /* muscles — share of volume over the last 8 weeks */
  const windowStart = isoAddDays(monday, -49);
  const dayById = new Map(workouts.map((w) => [w.id, w.performedAt]));
  const volByGroup = new Map<string, number>();
  for (const it of items) {
    const day = dayById.get(it.workoutId);
    if (!day || day < windowStart) continue;
    const v = itemVolume(it.sets);
    if (v > 0) volByGroup.set(it.muscleGroup, (volByGroup.get(it.muscleGroup) ?? 0) + v);
  }
  const totalVol = [...volByGroup.values()].reduce((a, b) => a + b, 0);
  let muscles: MuscleSlice[] = [];
  if (totalVol > 0) {
    muscles = [...volByGroup.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, v]) => ({ name, pct: Math.round((v / totalVol) * 100), color: MUSCLE_COLORS[name] ?? "#9aa7a0" }));
    const diff = 100 - muscles.reduce((s, m) => s + m.pct, 0);
    if (muscles.length > 0 && diff !== 0) muscles[0].pct += diff;
  }

  /* sparklines over the same 8 weeks */
  const sparkPoints: number[] = [];
  const sparkRunKm: number[] = [];
  const sparkWorkouts: number[] = [];
  const sparkVolume: number[] = [];
  for (let k = 7; k >= 0; k--) {
    const ws = isoAddDays(monday, -7 * k);
    const we = isoAddDays(ws, 6);
    let p = 0;
    let c = 0;
    let v = 0;
    let runM = 0;
    for (const w of workouts) {
      if (!inRange(w.performedAt, ws, we)) continue;
      c += 1;
      v += w.volumeKg;
      p += pointsBy.get(w.id) ?? 0;
      for (const it of byWorkout.get(w.id) ?? []) {
        if (it.exerciseId === "e-run") runM += it.distanceM ?? 0;
      }
    }
    sparkPoints.push(p);
    sparkRunKm.push(Math.round(runM / 100) / 10);
    sparkWorkouts.push(c);
    sparkVolume.push(Math.round(v / 1000));
  }

  return {
    week: {
      label,
      volumeKg: week.volumeKg,
      targetKg: WEEK_GOALS.volumeKg,
      points: week.points,
      pointsTarget: WEEK_GOALS.points,
      workouts: week.count,
      workoutsTarget: WEEK_GOALS.workouts,
      minutes: week.minutes,
      deltaPct,
      exercises: week.exercises,
      runM: week.runM,
      pointsDelta: week.points - prev.points,
      workoutsDelta: week.count - prev.count,
    },
    charts: { weeks, months, year },
    muscles,
    sparklines: {
      points: sparkPoints,
      runKm: sparkRunKm,
      workouts: sparkWorkouts,
      volume: sparkVolume,
    },
  };
}

export function buildLeaderboard(userId: string, metric: LeaderMetric): LeaderRow[] {
  const users = getRaw()
    .prepare('SELECT id, name, avatar_from AS "from", avatar_to AS "to" FROM users ORDER BY id')
    .all() as { id: string; name: string; from: string; to: string }[];
  const points = new Map(
    (getRaw()
      .prepare("SELECT user_id AS id, SUM(amount) AS v FROM point_events GROUP BY user_id")
      .all() as { id: string; v: number }[]).map((r) => [r.id, r.v]),
  );
  const counts = new Map(
    (getRaw()
      .prepare("SELECT user_id AS id, COUNT(*) AS c, SUM(volume_kg) AS v FROM workouts GROUP BY user_id")
      .all() as { id: string; c: number; v: number }[]).map((r) => [r.id, r]),
  );
  const dayRows = getRaw()
    .prepare("SELECT user_id AS id, performed_at AS d FROM workouts")
    .all() as { id: string; d: string }[];
  const daysBy = new Map<string, Set<string>>();
  for (const r of dayRows) {
    let s = daysBy.get(r.id);
    if (!s) daysBy.set(r.id, (s = new Set()));
    s.add(r.d);
  }

  const rows = users.map((u) => {
    const c = counts.get(u.id);
    return {
      name: u.name,
      initials: initials(u.name),
      points: points.get(u.id) ?? 0,
      workouts: c?.c ?? 0,
      volumeKg: Math.round(c?.v ?? 0),
      streak: currentStreak(daysBy.get(u.id) ?? new Set()),
      from: u.from,
      to: u.to,
      me: u.id === userId,
    };
  });

  const value = (r: (typeof rows)[number]): number =>
    metric === "points" ? r.points : metric === "workouts" ? r.workouts : metric === "volume" ? r.volumeKg : r.streak;

  rows.sort((a, b) => value(b) - value(a) || b.points - a.points);
  return rows.map((r, i) => ({ ...r, rank: i + 1 })) as LeaderRow[];
}

export function computeAchievementStats(userId: string): AchievementStats {
  const workouts = loadWorkouts(userId);
  const days = workouts.map((w) => w.performedAt);
  const points = sumPoints(userId);

  const weekly = new Map<string, number>();
  for (const w of workouts) {
    const ws = weekStartIso(w.performedAt);
    weekly.set(ws, (weekly.get(ws) ?? 0) + w.volumeKg);
  }

  const items = loadItems(userId);
  const dayById = new Map(workouts.map((w) => [w.id, w.performedAt]));
  const groups = new Set<string>();
  for (const it of items) {
    if (it.muscleGroup !== "Кардио" && dayById.has(it.workoutId)) groups.add(it.muscleGroup);
  }

  return {
    workouts: workouts.length,
    bestWeekVolumeKg: Math.round(Math.max(0, ...weekly.values())),
    bestStreak: bestStreak(days),
    currentStreak: currentStreak(new Set(days)),
    totalPoints: points,
    muscleGroups: groups.size,
  };
}

const fmtUnlockDate = (iso: string) => {
  const s = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(
    new Date(`${iso}T12:00:00`),
  );
  return s.replace(".", "");
};

export function buildAchievements(userId: string): Achievement[] {
  const stats = computeAchievementStats(userId);
  const unlockedRows = getRaw()
    .prepare(
      `SELECT a.code AS code, ua.unlocked_at AS at
       FROM user_achievements ua JOIN achievements a ON a.id = ua.achievement_id
       WHERE ua.user_id = ?`,
    )
    .all(userId) as { code: string; at: string }[];
  const unlocked = new Map(unlockedRows.map((r) => [r.code, r.at]));

  return ACHIEVEMENT_CATALOG.map((a) => {
    const at = unlocked.get(a.code);
    if (at) return { code: a.code, title: a.title, desc: a.description, icon: a.icon, date: fmtUnlockDate(at), unlocked: true, unlockedAt: at };
    const progress = Math.min(achievementProgress(a.code as AchievementCode, stats), achievementTarget(a.code as AchievementCode));
    return {
      code: a.code,
      title: a.title,
      desc: a.description,
      icon: a.icon,
      date: "",
      unlocked: false,
      progress,
      total: achievementTarget(a.code as AchievementCode),
    };
  });
}

/** Persist newly reached achievements; return the ones unlocked right now. */
export function syncAchievements(userId: string): UnlockInfo[] {
  const db = getRaw();
  const insAch = db.prepare(
    "INSERT OR IGNORE INTO achievements (id, code, title, description, icon) VALUES (?, ?, ?, ?, ?)",
  );
  for (const a of ACHIEVEMENT_CATALOG) insAch.run(a.code, a.code, a.title, a.description, a.icon);

  const stats = computeAchievementStats(userId);
  const have = new Set(
    (db
      .prepare(
        "SELECT a.code AS code FROM user_achievements ua JOIN achievements a ON a.id = ua.achievement_id WHERE ua.user_id = ?",
      )
      .all(userId) as { code: string }[]).map((r) => r.code),
  );

  const fresh: UnlockInfo[] = [];
  const ins = db.prepare(
    "INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)",
  );
  for (const a of ACHIEVEMENT_CATALOG) {
    if (have.has(a.code)) continue;
    if (isAchievementUnlocked(a.code, stats)) {
      ins.run(userId, a.code, isoToday());
      fresh.push({ code: a.code, title: a.title, icon: a.icon });
    }
  }
  return fresh;
}

export function buildRecords(userId: string): PersonalRecord[] {
  const workouts = loadWorkouts(userId);
  const dayById = new Map(workouts.map((w) => [w.id, w.performedAt]));
  const best = new Map<string, { weight: number; day: string; name: string }>();
  for (const it of loadItems(userId)) {
    const day = dayById.get(it.workoutId);
    if (!day) continue;
    for (const s of it.sets) {
      if (s.weightKg <= 0) continue;
      const cur = best.get(it.exerciseId);
      if (!cur || s.weightKg > cur.weight) best.set(it.exerciseId, { weight: s.weightKg, day, name: it.name });
    }
  }
  return [...best.values()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((r) => ({ name: r.name, value: kgLabel(r.weight), unit: "кг", date: dateShort(r.day) }));
}

export function listExercises(query: string, muscle: string): Exercise[] {
  const q = query.trim().toLowerCase();
  const rows = getRaw()
    .prepare(
      `SELECT id, name, muscle_group AS muscleGroup, equipment, description,
              media_url AS mediaUrl, media_type AS mediaType
       FROM exercises
       WHERE (? = '' OR instr(lower(name), ?) > 0)
         AND (? = '' OR muscle_group = ?)
       ORDER BY rowid`,
    )
    .all(q, q, muscle, muscle) as {
    id: string;
    name: string;
    muscleGroup: string;
    equipment: string;
    description: string;
    mediaUrl: string;
    mediaType: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    muscleGroup: r.muscleGroup as MuscleGroup,
    equipment: r.equipment,
    description: r.description,
    mediaUrl: r.mediaUrl,
    mediaType: r.mediaType === "animation" ? "animation" : "video",
  }));
}
