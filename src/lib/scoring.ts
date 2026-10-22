/* Pure gamification formulas — the single place points/streak/achievements
   are defined (AGENTS.md). Used by API routes AND the seed. No DB imports. */

export interface WorkoutSet {
  reps: number;
  weightKg: number;
}

export const WEEK_GOALS = {
  volumeKg: 15000,
  points: 750,
  workouts: 4,
};

export function itemVolume(sets: WorkoutSet[]): number {
  return sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
}

export function workoutVolumeKg(items: Array<{ sets: WorkoutSet[] }>): number {
  return Math.round(items.reduce((sum, i) => sum + itemVolume(i.sets), 0));
}

/* 10 + floor(volume/100); cardio sessions carry no volume → 1 pt/minute, min 10.
   Streak bonus ×(1 + 0.1 × min(streak, 5)). */
export function workoutPoints(input: {
  volumeKg: number;
  minutes: number;
  streak: number;
}): number {
  const base =
    input.volumeKg > 0
      ? 10 + Math.floor(input.volumeKg / 100)
      : Math.max(10, Math.round(input.minutes));
  const bonus = 1 + 0.1 * Math.min(Math.max(input.streak, 0), 5);
  return Math.round(base * bonus);
}

/* ---------- ISO date helpers (local dates, YYYY-MM-DD) ---------- */

export function isoOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isoToday(): string {
  return isoOf(new Date());
}

export function isoAddDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return isoOf(d);
}

/** Monday of the ISO week containing `iso`. */
export function weekStartIso(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const dow = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - dow);
  return isoOf(d);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM
}

/* ---------- streaks ---------- */

/** Length of the consecutive-day chain ending at `day` (inclusive). */
export function streakEndingAt(days: Set<string>, day: string): number {
  let n = 0;
  let cur = day;
  while (days.has(cur)) {
    n += 1;
    cur = isoAddDays(cur, -1);
  }
  return n;
}

/** Current streak, tolerating a not-yet-trained today. */
export function currentStreak(days: Set<string>, today = isoToday()): number {
  let start = today;
  if (!days.has(start)) {
    start = isoAddDays(today, -1);
    if (!days.has(start)) return 0;
  }
  return streakEndingAt(days, start);
}

export function bestStreak(days: string[]): number {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev !== null && isoAddDays(prev, 1) === d ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}

/* ---------- achievements ---------- */

export type AchievementCode =
  | "first"
  | "five"
  | "ten"
  | "streak7"
  | "streak30"
  | "tons10"
  | "groups3"
  | "points1k";

export interface AchievementStats {
  workouts: number;
  bestWeekVolumeKg: number;
  bestStreak: number;
  currentStreak: number;
  totalPoints: number;
  muscleGroups: number;
}

export const ACHIEVEMENT_CATALOG: ReadonlyArray<{
  code: AchievementCode;
  title: string;
  description: string;
  icon: string;
}> = [
  { code: "first", title: "Первый шаг", description: "Первая тренировка", icon: "zap" },
  { code: "five", title: "Пять тренировок", description: "5 занятий в журнале", icon: "check" },
  { code: "ten", title: "Десятка", description: "10 тренировок", icon: "layers" },
  { code: "streak7", title: "Серия 7 дней", description: "Неделя без пропусков", icon: "flame" },
  { code: "tons10", title: "10 тонн", description: "10 000 кг за неделю", icon: "medal" },
  { code: "groups3", title: "Три группы", description: "Грудь, спина и ноги", icon: "target" },
  { code: "points1k", title: "1000 очков", description: "Первая тысяча", icon: "trophy" },
  { code: "streak30", title: "Серия 30 дней", description: "Месяц дисциплины", icon: "lock" },
];

export function achievementTarget(code: AchievementCode): number {
  switch (code) {
    case "first":
      return 1;
    case "five":
      return 5;
    case "ten":
      return 10;
    case "streak7":
      return 7;
    case "streak30":
      return 30;
    case "tons10":
      return 10000;
    case "groups3":
      return 3;
    case "points1k":
      return 1000;
  }
}

export function achievementProgress(
  code: AchievementCode,
  s: AchievementStats,
): number {
  switch (code) {
    case "first":
    case "five":
    case "ten":
      return s.workouts;
    case "streak7":
    case "streak30":
      return Math.max(s.currentStreak, s.bestStreak);
    case "tons10":
      return s.bestWeekVolumeKg;
    case "groups3":
      return s.muscleGroups;
    case "points1k":
      return s.totalPoints;
  }
}

export function isAchievementUnlocked(code: AchievementCode, s: AchievementStats): boolean {
  return achievementProgress(code, s) >= achievementTarget(code);
}
