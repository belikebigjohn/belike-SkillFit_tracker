/* Zod schemas shared by API routes (request boundary) and, later, forms. */

import { z } from "zod";
import { MUSCLE_GROUPS } from "@/lib/types";

export const GOALS = [
  "Набор массы",
  "Сила",
  "Выносливость",
  "Похудение",
  "Здоровье",
] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

export const loginSchema = z.object({
  email: z.email("Введите корректный e-mail"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Как к вам обращаться?").max(60),
  email: z.email("Введите корректный e-mail"),
  password: z.string().min(6, "Минимум 6 символов"),
  goal: z.enum(GOALS).optional(),
});

export const workoutCreateSchema = z.object({
  title: z.string().trim().min(1, "Укажите название").max(80),
  group: z.enum(MUSCLE_GROUPS).optional(),
  performedAt: isoDate.optional(),
  minutes: z.number().int().min(0).max(600).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const workoutPatchSchema = workoutCreateSchema.partial();

export const exerciseAddSchema = z.object({
  exerciseId: z.string().min(1),
});

export const workoutSetSchema = z.object({
  reps: z.number().int().min(0).max(200),
  weightKg: z.number().min(0).max(5000),
});

/** Full replacement of an item's result: the editor always sends all sets. */
export const itemPatchSchema = z.object({
  sets: z.array(workoutSetSchema).max(30),
  durationSec: z.number().int().min(0).max(86400).nullish(),
  distanceM: z.number().min(0).max(200000).nullish(),
  note: z.string().max(300).nullish(),
});

export const itemRemoveSchema = z.object({
  itemId: z.string().min(1),
});

/** PATCH payload for one workout item: id + full result. */
export const itemSaveSchema = itemPatchSchema.extend({
  itemId: z.string().min(1),
});

export const mePatchSchema = z.object({
  name: z.string().trim().min(2, "Как к вам обращаться?").max(60).optional(),
  goal: z.enum(GOALS).optional(),
});
