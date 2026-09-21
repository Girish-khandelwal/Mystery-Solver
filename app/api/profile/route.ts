import { NextResponse } from "next/server";
import { z } from "zod";
import { session, assertOrigin } from "@/lib/session";
import { profileFor } from "@/lib/profile";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function GET() {
  try {
    const u = await session(true);
    return NextResponse.json(await profileFor(u!.id));
  } catch {
    return NextResponse.json(
      {
        error:
          "The detective database is unavailable. Check database setup and try again.",
      },
      { status: 503 },
    );
  }
}
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const { username } = z
      .object({ username: z.string().trim().min(2).max(32) })
      .parse(await req.json());
    const u = await session(true);
    await db.user.update({ where: { id: u!.id }, data: { username } });
    return NextResponse.json(await profileFor(u!.id));
  } catch {
    return NextResponse.json(
      { error: "Choose a name between 2 and 32 characters." },
      { status: 400 },
    );
  }
}
