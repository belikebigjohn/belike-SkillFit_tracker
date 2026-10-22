import { getSessionUserId } from "@/lib/auth";
import { buildSessions } from "@/lib/queries";
import { createWorkout } from "@/lib/mutations";
import { workoutCreateSchema } from "@/lib/validators";
import { fail, json, parseBody, unauthorized, zodFields } from "@/lib/http";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  return json(buildSessions(userId));
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const parsed = workoutCreateSchema.safeParse(await parseBody(req));
  if (!parsed.success) {
    return fail(400, "validation_error", "Проверьте данные", zodFields(parsed.error));
  }
  const { id, unlocked } = createWorkout(userId, parsed.data);
  return json({ id, unlocked }, 201);
}
