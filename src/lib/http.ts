/* Shared helpers for route handlers: the error envelope from AGENTS.md —
   { error: { code, message, fields? } } with 400/401/403/404/409/500. */

import { NextResponse } from "next/server";
import type { z } from "zod";

export function json<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function fail(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): NextResponse {
  return NextResponse.json({ error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}

/** Fresh 401 for every call — NextResponse instances must not be shared. */
export function unauthorized(): NextResponse {
  return fail(401, "unauthorized", "Войдите, чтобы продолжить");
}

/** Zod issues → { fieldName: firstMessage } for form mapping. */
export function zodFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export async function parseBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
