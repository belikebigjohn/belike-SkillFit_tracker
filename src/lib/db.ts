/* SQLite bootstrap — this DDL is the runtime source of truth for the schema
   (drizzle in schema.ts only types the queries). Opens data/app.db on first
   use, creates tables when missing and seeds an empty database so that
   `npm run dev` works right after clone with zero setup. */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/schema";
import { seedDatabase } from "@/db/seed";

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  goal TEXT NOT NULL DEFAULT 'Здоровье',
  avatar_from TEXT NOT NULL DEFAULT '#a3f900',
  avatar_to TEXT NOT NULL DEFAULT '#64d2ff',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  media_url TEXT NOT NULL DEFAULT '',
  media_type TEXT NOT NULL DEFAULT 'video'
);
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  performed_at TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  "group" TEXT NOT NULL DEFAULT '',
  minutes INTEGER NOT NULL DEFAULT 0,
  volume_kg REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  sort INTEGER NOT NULL DEFAULT 1,
  sets_json TEXT NOT NULL DEFAULT '[]',
  duration_sec INTEGER,
  distance_m REAL,
  note TEXT
);
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TEXT NOT NULL,
  PRIMARY KEY (user_id, achievement_id)
);
CREATE TABLE IF NOT EXISTS point_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  workout_id TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_performed ON workouts(performed_at);
CREATE INDEX IF NOT EXISTS idx_wex_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_pe_user ON point_events(user_id);
`;

export type Db = BetterSQLite3Database<typeof schema>;

type Holder = { raw: Database.Database; db: Db };

// Survive dev HMR: one open handle per process, not one per module reload.
const g = globalThis as unknown as { __skillfitDb?: Holder };

function open(): Holder {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const raw = new Database(path.join(dir, "app.db"));
  raw.pragma("journal_mode = WAL");
  raw.pragma("foreign_keys = ON");
  raw.exec(DDL);
  return { raw, db: drizzle(raw, { schema }) };
}

function holder(): Holder {
  if (!g.__skillfitDb) {
    const h = open();
    const { count } = h.raw
      .prepare("SELECT COUNT(*) AS count FROM users")
      .get() as { count: number };
    if (count === 0) seedDatabase(h.raw);
    g.__skillfitDb = h;
  }
  return g.__skillfitDb;
}

/** Typed drizzle instance for queries. */
export function getDb(): Db {
  return holder().db;
}

/** Raw better-sqlite3 handle — used by the seed and hot aggregate reads. */
export function getRaw(): Database.Database {
  return holder().raw;
}
