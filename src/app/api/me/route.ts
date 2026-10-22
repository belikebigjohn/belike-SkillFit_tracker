import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth";
import { getDb } from "@/lib/db";
import * as t from "@/lib/schema";
import { buildUserView } from "@/lib/queries";
import { mePatchSchema } from "@/lib/validators";
import { fail, json, parseBody, unauthorized, zodFields } from "@/lib/http";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const view = buildUserView(userId);
  if (!view) return unauthorized();
  return json(view);
}

export async function PATCH(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const parsed = mePatchSchema.safeParse(await parseBody(req));
  if (!parsed.success) {
    return fail(400, "validation_error", "Проверьте данные", zodFields(parsed.error));
  }
  const updates: Partial<{ name: string; goal: string }> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.goal !== undefined) updates.goal = parsed.data.goal;
  if (Object.keys(updates).length > 0) {
    getDb().update(t.users).set(updates).where(eq(t.users.id, userId)).run();
  }
  return json(buildUserView(userId));
}
