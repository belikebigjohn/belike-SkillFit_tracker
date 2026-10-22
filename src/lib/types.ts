/* Domain types — shapes mirror the future REST API (see AGENTS.md). */

export const MUSCLE_GROUPS = [
  "Ноги",
  "Спина",
  "Грудь",
  "Плечи",
  "Руки",
  "Кардио",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export interface User {
  name: string;
  initials: string;
  goal: string;
  streak: number;
  points: number;
  workouts: number;
  rank: number;
}

export interface WeekSummary {
  label: string;
  volumeKg: number;
  targetKg: number;
  points: number;
  pointsTarget: number;
  workouts: number;
  workoutsTarget: number;
  minutes: number;
  deltaPct: number;
  exercises: number;
  /** change vs the previous week — used by dashboard KPI footers */
  pointsDelta?: number;
  workoutsDelta?: number;
  streakDelta?: number;
}

export interface ChartSeries {
  label: string;
  labels: string[];
  values: number[];
  avg: number;
  best: number;
}

export interface MuscleSlice {
  name: string;
  pct: number;
  color: string;
}

export interface Achievement {
  code: string;
  title: string;
  desc: string;
  icon: string;
  date: string;
  unlocked: boolean;
  /** ISO date of unlock, "" while locked — lets the topbar badge filter recent ones */
  unlockedAt?: string;
  progress?: number;
  total?: number;
}

export interface LeaderRow {
  rank: number;
  name: string;
  initials: string;
  points: number;
  workouts: number;
  volumeKg: number;
  streak: number;
  from: string;
  to: string;
  me: boolean;
}

export type LeaderMetric = "points" | "workouts" | "volume" | "streak";

export interface Session {
  id: string;
  weekday: string;
  day: string;
  month: string;
  date: string;
  title: string;
  group: string;
  exercises: number;
  minutes: number;
  volumeKg: number;
  points: number;
  top: string;
  today: boolean;
  record?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  description: string;
  mediaUrl: string;
  mediaType: "video" | "animation";
}

export interface WorkoutSet {
  reps: number;
  weightKg: number;
}

export interface WorkoutItem {
  id: string;
  exerciseId: string;
  name: string;
  order: number;
  sets: WorkoutSet[];
  /** cardio entries carry duration/distance instead of weighted sets */
  durationSec?: number | null;
  distanceM?: number | null;
}

/** Just-unlocked achievements returned by mutations for toasts. */
export interface AchievementUnlock {
  code: string;
  title: string;
  icon: string;
}

export interface WorkoutDetail {
  id: string;
  title: string;
  performedAt: string;
  notes: string;
  group: string;
  minutes: number;
  volumeKg: number;
  points: number;
  items: WorkoutItem[];
}

export interface PersonalRecord {
  name: string;
  value: string;
  unit: string;
  date: string;
}
