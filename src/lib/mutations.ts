/* Server-only write side. Every mutation re-computes volume/points with
   lib/scoring, replaces the workout's point event and syncs achievements,
   so points in the DB are always consistent with the formulas. */

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb, getRaw } from "@/lib/db";
import * as t from "@/lib/schema";
import { isoToday, itemVolume, streakEndingAt, workoutPoints, type WorkoutSet } from "@/lib/scoring";
import { buildWorkoutDetail, getOwnedWorkout, syncAchievements, type UnlockInfo } from "@/lib/queries";
import type { WorkoutDetail } from "@/lib/types";

export interface WorkoutMutation {
  workout: WorkoutDetail;
  unlocked: UnlockInfo[];
}

export function createWorkout(
  userId: string,
  input: { title: string; group?: string; performedAt?: string; minutes?: number; notes?: string },
): { id: string; unlocked: UnlockInfo[] } {
  const id = randomUUID();
  getDb()
    .insert(t.workouts)
    .values({
      id,
      userId,
      title: input.title,
      performedAt: input.performedAt ?? isoToday(),
      notes: input.notes ?? "",
      group: input.group ?? "",
      minutes: input.minutes ?? 0,
      volumeKg: 0,
      createdAt: new Date().toISOString(),
    })
    .run();
  return { id, unlocked: syncAchievements(userId) };
}

export function updateWorkout(
  userId: string,
  workoutId: string,
  patch: { title?: string; group?: string; performedAt?: string; minutes?: number; notes?: string },
): WorkoutMutation | null {
  if (!getOwnedWorkout(userId, workoutId)) return null;
  const updates: Partial<{ title: string; group: string; performedAt: string; minutes: number; notes: string }> = {};
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.group !== undefined) updates.group = patch.group;
  if (patch.performedAt !== undefined) updates.performedAt = patch.performedAt;
  if (patch.minutes !== undefined) updates.minutes = patch.minutes;
  if (patch.notes !== undefined) updates.notes = patch.notes;
  if (Object.keys(updates).length > 0) {
    getDb()
      .update(t.workouts)
      .set(updates)
      .where(and(eq(t.workouts.id, workoutId), eq(t.workouts.userId, userId)))
      .run();
  }
  return recalcWorkout(userId, workoutId);
}

export function deleteWorkout(userId: string, workoutId: string): boolean {
  const res = getDb()
    .delete(t.workouts)
    .where(and(eq(t.workouts.id, workoutId), eq(t.workouts.userId, userId)))
    .run();
  if (res.changes === 0) return false;
  getDb()
    .delete(t.pointEvents)
    .where(and(eq(t.pointEvents.workoutId, workoutId), eq(t.pointEvents.userId, userId)))
    .run();
  return true;
}

/** Adds an exercise to the workout with starter values the editor overwrites. */
export function addExerciseItem(
  userId: string,
  workoutId: string,
  exerciseId: string,
): WorkoutMutation | null {
  const raw = getRaw();
  if (!getOwnedWorkout(userId, workoutId)) return null;
  const exercise = raw
    .prepare("SELECT id, muscle_group AS muscleGroup FROM exercises WHERE id = ?")
    .get(exerciseId) as { id: string; muscleGroup: string } | undefined;
  if (!exercise) return null;

  const { next } = raw
    .prepare("SELECT COALESCE(MAX(sort), 0) + 1 AS next FROM workout_exercises WHERE workout_id = ?")
    .get(workoutId) as { next: number };

  const isCardio = exercise.muscleGroup === "Кардио";
  const sets: WorkoutSet[] = isCardio ? [] : [{ reps: 8, weightKg: 0 }, { reps: 8, weightKg: 0 }, { reps: 8, weightKg: 0 }];
  raw
    .prepare(
      `INSERT INTO workout_exercises (id, workout_id, exercise_id, sort, sets_json, duration_sec, distance_m, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    )
    .run(
      randomUUID(),
      workoutId,
      exerciseId,
      next,
      JSON.stringify(sets),
      isCardio ? 1800 : null,
      isCardio ? 5000 : null,
    );
  return recalcWorkout(userId, workoutId);
}

export function updateItem(
  userId: string,
  workoutId: string,
  itemId: string,
  data: { sets: WorkoutSet[]; durationSec?: number | null; distanceM?: number | null; note?: string | null },
): WorkoutMutation | null {
  const raw = getRaw();
  if (!getOwnedWorkout(userId, workoutId)) return null;
  const item = raw
    .prepare(
      `SELECT we.id FROM workout_exercises we
       JOIN workouts w ON w.id = we.workout_id
       WHERE we.id = ? AND we.workout_id = ? AND w.user_id = ?`,
    )
    .get(itemId, workoutId, userId);
  if (!item) return null;

  raw
    .prepare(
      `UPDATE workout_exercises
       SET sets_json = ?, duration_sec = ?, distance_m = ?, note = COALESCE(?, note)
       WHERE id = ?`,
    )
    .run(
      JSON.stringify(data.sets),
      data.durationSec ?? null,
      data.distanceM ?? null,
      data.note ?? null,
      itemId,
    );
  return recalcWorkout(userId, workoutId);
}

export function removeItem(userId: string, workoutId: string, itemId: string): WorkoutMutation | null {
  const raw = getRaw();
  if (!getOwnedWorkout(userId, workoutId)) return null;
  const res = raw
    .prepare(
      `DELETE FROM workout_exercises
       WHERE id = ? AND workout_id = ?
         AND (SELECT user_id FROM workouts WHERE id = ?) = ?`,
    )
    .run(itemId, workoutId, workoutId, userId);
  if (res.changes === 0) return null;
  return recalcWorkout(userId, workoutId);
}

/** Volume → points → point_events → achievements, in one consistent pass. */
function recalcWorkout(userId: string, workoutId: string): WorkoutMutation {
  const raw = getRaw();
  const w = getOwnedWorkout(userId, workoutId)!;

  const setRows = raw
    .prepare("SELECT sets_json AS setsJson FROM workout_exercises WHERE workout_id = ?")
    .all(workoutId) as { setsJson: string }[];
  const parsedSets = setRows.map((r) => {
    try {
      const v = JSON.parse(r.setsJson);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });
  const volumeKg = Math.round(parsedSets.reduce((sum: number, sets: WorkoutSet[]) => sum + itemVolume(sets), 0));
  raw.prepare("UPDATE workouts SET volume_kg = ? WHERE id = ?").run(volumeKg, workoutId);

  const dayRows = raw
    .prepare("SELECT performed_at AS d FROM workouts WHERE user_id = ?")
    .all(userId) as { d: string }[];
  const days = new Set(dayRows.map((r) => r.d));
  const streak = days.has(w.performedAt) ? streakEndingAt(days, w.performedAt) : 0;

  const hasContent = setRows.length > 0;
  const points = hasContent || w.minutes > 0 ? workoutPoints({ volumeKg, minutes: w.minutes, streak }) : 0;

  raw.prepare("DELETE FROM point_events WHERE workout_id = ?").run(workoutId);
  if (points > 0) {
    raw
      .prepare("INSERT INTO point_events (id, user_id, amount, reason, workout_id, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(randomUUID(), userId, points, `Тренировка «${w.title}»`, workoutId, new Date().toISOString());
  }

  const unlocked = syncAchievements(userId);
  return { workout: buildWorkoutDetail(userId, workoutId)!, unlocked };
}
