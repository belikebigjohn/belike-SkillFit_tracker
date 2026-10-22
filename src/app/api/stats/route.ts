import { getSessionUserId } from "@/lib/auth";
import { buildStats } from "@/lib/queries";
import { json, unauthorized } from "@/lib/http";

/**
 * GET /api/stats?period=week|month|all
 * The dashboard consumes all periods in one pass, so `period` is accepted
 * but the response always carries week + charts + muscles + sparklines.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  return json(buildStats(userId));
}
