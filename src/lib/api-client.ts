/* Single data entry point for all components (AGENTS.md rule).
   Module A: mock adapter below. Module B: swap bodies to fetch() the REST API.
   Components never import mock data directly. */

import {
  mockAchievements,
  mockCharts,
  mockExercises,
  mockLeaderboard,
  mockMuscles,
  mockRecords,
  mockSessions,
  mockSparklines,
  mockUser,
  mockWeek,
  mockWorkoutDetails,
} from "@/lib/mock/data";
import type {
  Achievement,
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
} from "@/lib/types";

const LATENCY_MS = 150;

function delayed<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export interface ApiClient {
  getMe(): Promise<User>;
  getDashboard(): Promise<{
    user: User;
    week: WeekSummary;
    charts: Record<"weeks" | "months" | "year", ChartSeries>;
    muscles: MuscleSlice[];
    achievements: Achievement[];
    leaderboard: LeaderRow[];
    sparklines: Record<string, number[]>;
  }>;
  getWorkouts(): Promise<Session[]>;
  getWorkout(id: string): Promise<WorkoutDetail | null>;
  getExercises(query: string, muscle: string): Promise<Exercise[]>;
  getLeaderboard(metric: LeaderMetric): Promise<LeaderRow[]>;
  getAchievements(): Promise<Achievement[]>;
  getRecords(): Promise<PersonalRecord[]>;
}

function metricValue(row: LeaderRow, metric: LeaderMetric): number {
  switch (metric) {
    case "points":
      return row.points;
    case "workouts":
      return row.workouts;
    case "volume":
      return row.volumeKg;
    case "streak":
      return row.streak;
  }
}

export const api: ApiClient = {
  getMe: () => delayed(mockUser),

  getDashboard: () =>
    delayed({
      user: mockUser,
      week: mockWeek,
      charts: mockCharts,
      muscles: mockMuscles,
      achievements: mockAchievements,
      leaderboard: mockLeaderboard.slice(0, 5),
      sparklines: mockSparklines,
    }),

  getWorkouts: () => delayed(mockSessions),

  getWorkout: (id) => delayed(mockWorkoutDetails[id] ?? null),

  getExercises: (query, muscle) => {
    const q = query.trim().toLowerCase();
    const list = mockExercises.filter(
      (e) =>
        (muscle === "Все" || e.muscleGroup === muscle) &&
        (q === "" || e.name.toLowerCase().includes(q)),
    );
    return delayed(list);
  },

  getLeaderboard: (metric) =>
    delayed(
      [...mockLeaderboard]
        .sort((a, b) => metricValue(b, metric) - metricValue(a, metric))
        .map((row, i) => ({ ...row, rank: i + 1 })),
    ),

  getAchievements: () => delayed(mockAchievements),

  getRecords: () => delayed(mockRecords),
};
