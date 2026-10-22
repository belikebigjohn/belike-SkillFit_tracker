import { getSessionUserId } from "@/lib/auth";
import { buildRecords } from "@/lib/queries";
import { json, unauthorized } from "@/lib/http";

/** Personal records for the profile screen (top-3 all-time lifts). */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  return json(buildRecords(userId));
}
