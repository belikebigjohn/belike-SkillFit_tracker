import { getSessionUserId } from "@/lib/auth";
import { listExercises } from "@/lib/queries";
import { unauthorized } from "@/lib/http";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const params = new URL(req.url).searchParams;
  const q = params.get("q") ?? "";
  let muscle = params.get("muscle") ?? "";
  if (muscle === "Все") muscle = ""; // UI filter label, not a DB value

  return NextResponse.json(listExercises(q, muscle));
}
