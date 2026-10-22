import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import * as t from "@/lib/schema";
import { SESSION_COOKIE, sessionCookieOptions, signSessionToken, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { buildUserView } from "@/lib/queries";
import { fail, json, parseBody, zodFields } from "@/lib/http";

export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await parseBody(req));
  if (!parsed.success) {
    return fail(400, "validation_error", "Проверьте данные", zodFields(parsed.error));
  }
  const email = parsed.data.email.toLowerCase();

  const user = getDb()
    .select()
    .from(t.users)
    .where(eq(t.users.email, email))
    .get();
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    // one message for both cases — don't leak which e-mails exist
    return fail(401, "invalid_credentials", "Неверный e-mail или пароль");
  }

  const res = json(buildUserView(user.id));
  res.cookies.set(SESSION_COOKIE, await signSessionToken(user.id), sessionCookieOptions);
  return res;
}
