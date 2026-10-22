import { getSessionUserId } from "@/lib/auth";
import { buildLeaderboard } from "@/lib/queries";
import { fail, json, unauthorized } from "@/lib/http";
import type { LeaderMetric } from "@/lib/types";

const METRICS: LeaderMetric[] = ["points", "workouts", "volume", "streak"];

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const param = new URL(req.url).searchParams.get("metric") ?? "points";
  if (!METRICS.includes(param as LeaderMetric)) {
    return fail(400, "validation_error", `Метрика должна быть одной из: ${METRICS.join(", ")}`);
  }
  return json(buildLeaderboard(userId, param as LeaderMetric));
}
