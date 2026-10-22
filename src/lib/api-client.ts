/* Single data entry point for all components (AGENTS.md rule).
   Module B: thin REST client over the real API. Components know nothing
   about URLs, auth or the error envelope beyond ApiError. */

import type {
  Achievement,
  AchievementUnlock,
  ChartSeries,
  Exercise,
  LeaderMetric,
  LeaderRow,
  MuscleSlice,
  PersonalRecord,
  Session,
  User,
  WeekSummary,
  WorkoutDetail,
  WorkoutSet,
} from "@/lib/types";

/** Error from the API envelope { error: { code, message, fields? } }. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.message : "Не удалось связаться с сервером";
}

export interface DashboardData {
  user: User;
  week: WeekSummary;
  charts: Record<"weeks" | "months" | "year", ChartSeries>;
  muscles: MuscleSlice[];
  achievements: Achievement[];
  leaderboard: LeaderRow[];
  sparklines: Record<string, number[]>;
}

export interface NewWorkoutInput {
  title: string;
  group?: string;
  performedAt?: string;
  minutes?: number;
  notes?: string;
}

export type WorkoutPatch = Partial<NewWorkoutInput>;

export interface ItemPatch {
  sets: WorkoutSet[];
  durationSec?: number | null;
  distanceM?: number | null;
}

export interface WorkoutMutation {
  workout: WorkoutDetail;
  unlocked: AchievementUnlock[];
}

interface StatsResponse {
  week: WeekSummary;
  charts: Record<"weeks" | "months" | "year", ChartSeries>;
  muscles: MuscleSlice[];
  sparklines: Record<string, number[]>;
}

async function request<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(path, {
    method: init?.method ?? "GET",
    headers: init?.body !== undefined ? { "content-type": "application/json" } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string; fields?: Record<string, string> } } | null)?.error;
    throw new ApiError(
      res.status,
      err?.code ?? "request_failed",
      err?.message ?? `Сервер ответил ${res.status}`,
      err?.fields,
    );
  }
  return data as T;
}

export interface ApiClient {
  /* reads */
  getMe(): Promise<User>;
  getDashboard(): Promise<DashboardData>;
  getWorkouts(): Promise<Session[]>;
  getWorkout(id: string): Promise<WorkoutDetail | null>;
  getExercises(query: string, muscle: string): Promise<Exercise[]>;
  getLeaderboard(metric: LeaderMetric): Promise<LeaderRow[]>;
  getAchievements(): Promise<Achievement[]>;
  getRecords(): Promise<PersonalRecord[]>;
  /* auth */
  login(input: { email: string; password: string }): Promise<User>;
  register(input: { name: string; email: string; password: string; goal?: string }): Promise<User>;
  logout(): Promise<void>;
  updateMe(patch: { name?: string; goal?: string }): Promise<User>;
  /* mutations */
  createWorkout(input: NewWorkoutInput): Promise<{ id: string; unlocked: AchievementUnlock[] }>;
  updateWorkout(id: string, patch: WorkoutPatch): Promise<WorkoutMutation>;
  deleteWorkout(id: string): Promise<void>;
  addExercise(workoutId: string, exerciseId: string): Promise<WorkoutMutation>;
  updateItem(workoutId: string, itemId: string, patch: ItemPatch): Promise<WorkoutMutation>;
  removeItem(workoutId: string, itemId: string): Promise<WorkoutMutation>;
}

export const api: ApiClient = {
  getMe: () => request<User>("/api/me"),

  getDashboard: async () => {
    const [user, stats, achievements, lb] = await Promise.all([
      request<User>("/api/me"),
      request<StatsResponse>("/api/stats"),
      request<Achievement[]>("/api/achievements"),
      request<LeaderRow[]>("/api/leaderboard?metric=points"),
    ]);
    return {
      user,
      week: stats.week,
      charts: stats.charts,
      muscles: stats.muscles,
      achievements,
      leaderboard: lb.slice(0, 5),
      sparklines: stats.sparklines,
    };
  },

  getWorkouts: () => request<Session[]>("/api/workouts"),

  getWorkout: async (id) => {
    try {
      return await request<WorkoutDetail>(`/api/workouts/${id}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  getExercises: (query, muscle) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (muscle && muscle !== "Все") params.set("muscle", muscle);
    const qs = params.toString();
    return request<Exercise[]>(`/api/exercises${qs ? `?${qs}` : ""}`);
  },

  getLeaderboard: (metric) => request<LeaderRow[]>(`/api/leaderboard?metric=${metric}`),

  getAchievements: () => request<Achievement[]>("/api/achievements"),

  getRecords: () => request<PersonalRecord[]>("/api/records"),

  login: (input) => request<User>("/api/auth/login", { method: "POST", body: input }),

  register: (input) =>
    request<User>("/api/auth/register", { method: "POST", body: input }),

  logout: () => request<void>("/api/auth/logout", { method: "POST" }),

  updateMe: (patch) => request<User>("/api/me", { method: "PATCH", body: patch }),

  createWorkout: (input) =>
    request<{ id: string; unlocked: AchievementUnlock[] }>("/api/workouts", {
      method: "POST",
      body: input,
    }),

  updateWorkout: (id, patch) =>
    request<WorkoutMutation>(`/api/workouts/${id}`, { method: "PATCH", body: patch }),

  deleteWorkout: (id) => request<void>(`/api/workouts/${id}`, { method: "DELETE" }),

  addExercise: (workoutId, exerciseId) =>
    request<WorkoutMutation>(`/api/workouts/${workoutId}/exercises`, {
      method: "POST",
      body: { exerciseId },
    }),

  updateItem: (workoutId, itemId, patch) =>
    request<WorkoutMutation>(`/api/workouts/${workoutId}/exercises`, {
      method: "PATCH",
      body: { itemId, ...patch },
    }),

  removeItem: (workoutId, itemId) =>
    request<WorkoutMutation>(`/api/workouts/${workoutId}/exercises`, {
      method: "DELETE",
      body: { itemId },
    }),
};
