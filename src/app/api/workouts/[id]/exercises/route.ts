import { getSessionUserId } from "@/lib/auth";
import { addExerciseItem, removeItem, updateItem } from "@/lib/mutations";
import { exerciseAddSchema, itemRemoveSchema, itemSaveSchema } from "@/lib/validators";
import { fail, json, parseBody, unauthorized, zodFields } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

/** POST — add an exercise (starter sets, the editor overwrites them). */
export async function POST(req: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const parsed = exerciseAddSchema.safeParse(await parseBody(req));
  if (!parsed.success) {
    return fail(400, "validation_error", "Проверьте данные", zodFields(parsed.error));
  }
  const result = addExerciseItem(userId, id, parsed.data.exerciseId);
  if (!result) return fail(404, "not_found", "Тренировка или упражнение не найдены");
  return json(result, 201);
}

/** PATCH — save one item's result (sets / duration / distance). */
export async function PATCH(req: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const parsed = itemSaveSchema.safeParse(await parseBody(req));
  if (!parsed.success) {
    return fail(400, "validation_error", "Проверьте данные", zodFields(parsed.error));
  }
  const { itemId, sets, durationSec, distanceM, note } = parsed.data;
  const result = updateItem(userId, id, itemId, {
    sets,
    durationSec: durationSec ?? null,
    distanceM: distanceM ?? null,
    note: note ?? null,
  });
  if (!result) return fail(404, "not_found", "Упражнение не найдено в этой тренировке");
  return json(result);
}

/** DELETE — remove one item (body { itemId }). */
export async function DELETE(req: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const parsed = itemRemoveSchema.safeParse(await parseBody(req));
  if (!parsed.success) {
    return fail(400, "validation_error", "Проверьте данные", zodFields(parsed.error));
  }
  const result = removeItem(userId, id, parsed.data.itemId);
  if (!result) return fail(404, "not_found", "Упражнение не найдено в этой тренировке");
  return json(result);
}
