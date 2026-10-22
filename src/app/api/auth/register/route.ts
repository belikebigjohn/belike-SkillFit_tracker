import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import * as t from "@/lib/schema";
import { SESSION_COOKIE, hashPassword, sessionCookieOptions, signSessionToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { buildUserView, pickAvatar } from "@/lib/queries";
import { fail, json, parseBody, zodFields } from "@/lib/http";

export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await parseBody(req));
  if (!parsed.success) {
    return fail(400, "validation_error", "Проверьте данные", zodFields(parsed.error));
  }
  const { name, password, goal } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const db = getDb();
  const taken = db.select({ id: t.users.id }).from(t.users).where(eq(t.users.email, email)).get();
  if (taken) {
    return fail(409, "email_taken", "Этот e-mail уже зарегистрирован", {
      email: "Аккаунт с таким e-mail уже есть",
    });
  }

  const id = randomUUID();
  const avatar = pickAvatar(email);
  db.insert(t.users)
    .values({
      id,
      email,
      passwordHash: hashPassword(password),
      name,
      goal: goal ?? "Здоровье",
      avatarFrom: avatar.from,
      avatarTo: avatar.to,
      createdAt: new Date().toISOString(),
    })
    .run();

  const res = json(buildUserView(id)!, 201);
  res.cookies.set(SESSION_COOKIE, await signSessionToken(id), sessionCookieOptions);
  return res;
}
