import { getSessionUserId } from "@/lib/auth";
import { buildWorkoutDetail } from "@/lib/queries";
import { deleteWorkout, updateWorkout } from "@/lib/mutations";
import { workoutPatchSchema } from "@/lib/validators";
import { fail, json, parseBody, unauthorized, zodFields } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const workout = buildWorkoutDetail(userId, id);
  if (!workout) return fail(404, "not_found", "Тренировка не найдена");
  return json(workout);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const parsed = workoutPatchSchema.safeParse(await parseBody(req));
  if (!parsed.success) {
    return fail(400, "validation_error", "Проверьте данные", zodFields(parsed.error));
  }
  const result = updateWorkout(userId, id, parsed.data);
  if (!result) return fail(404, "not_found", "Тренировка не найдена");
  return json(result);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  if (!deleteWorkout(userId, id)) {
    return fail(404, "not_found", "Тренировка не найдена");
  }
  return json({ ok: true });
}
