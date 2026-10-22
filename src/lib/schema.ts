/* Drizzle table definitions — mirror the DDL in db.ts (db.ts is the runtime
   source of truth, this file types the queries). Units live in field names. */

import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  goal: text("goal").notNull().default("Здоровье"),
  avatarFrom: text("avatar_from").notNull().default("#c8f751"),
  avatarTo: text("avatar_to").notNull().default("#6ee7b7"),
  createdAt: text("created_at").notNull(),
});

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  equipment: text("equipment").notNull().default(""),
  description: text("description").notNull().default(""),
  mediaUrl: text("media_url").notNull().default(""),
  mediaType: text("media_type").notNull().default("video"),
});

export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  /** ISO date YYYY-MM-DD */
  performedAt: text("performed_at").notNull(),
  notes: text("notes").notNull().default(""),
  group: text("group").notNull().default(""),
  minutes: integer("minutes").notNull().default(0),
  /** Denormalised Σ(reps × weightKg) — recomputed on every save. */
  volumeKg: real("volume_kg").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const workoutExercises = sqliteTable("workout_exercises", {
  id: text("id").primaryKey(),
  workoutId: text("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  /** "order" is a SQL keyword — column is named `sort`. */
  order: integer("sort").notNull().default(1),
  setsJson: text("sets_json").notNull().default("[]"),
  durationSec: integer("duration_sec"),
  distanceM: real("distance_m"),
  note: text("note"),
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const userAchievements = sqliteTable(
  "user_achievements",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: text("unlocked_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })],
);

export const pointEvents = sqliteTable("point_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  workoutId: text("workout_id"),
  createdAt: text("created_at").notNull(),
});
