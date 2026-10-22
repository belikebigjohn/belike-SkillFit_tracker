import { getSessionUserId } from "@/lib/auth";
import { buildAchievements } from "@/lib/queries";
import { json, unauthorized } from "@/lib/http";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  return json(buildAchievements(userId));
}
