import { NextResponse } from "next/server";
import { z } from "zod";
import { session, assertOrigin } from "@/lib/session";
import { db } from "@/lib/db";
const schema = z.object({
  muted: z.boolean().optional(),
  soundVolume: z.number().int().min(0).max(100).optional(),
  musicVolume: z.number().int().min(0).max(100).optional(),
  textSize: z.enum(["normal", "large"]).optional(),
  reducedMotion: z.boolean().optional(),
  tutorialDone: z.boolean().optional(),
});
export async function GET() {
  try {
    const u = await session(true);
    return NextResponse.json(
      await db.settings.findUnique({ where: { userId: u!.id } }),
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to read settings." },
      { status: 503 },
    );
  }
}
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const settings = schema.parse(await req.json());
    const u = await session(true);
    return NextResponse.json(
      await db.settings.update({ where: { userId: u!.id }, data: settings }),
    );
  } catch {
    return NextResponse.json(
      { error: "Settings could not be saved." },
      { status: 400 },
    );
  }
}
export async function DELETE(req: Request) {
  try {
    assertOrigin(req);
    const { confirmation, caseId } = z
      .object({
        confirmation: z.literal("RESET"),
        caseId: z.string().optional(),
      })
      .parse(await req.json());
    if (confirmation !== "RESET") throw new Error();
    const u = await session(true);
    await db.$transaction(async (tx) => {
      await tx.caseProgress.deleteMany({
        where: { userId: u!.id, ...(caseId ? { caseId } : {}) },
      });
      const remaining = await tx.caseProgress.findMany({
        where: { userId: u!.id },
        include: { result: true },
      });
      await tx.playerProfile.update({
        where: { userId: u!.id },
        data: { xp: remaining.reduce((n, p) => n + (p.result?.score ?? 0), 0) },
      });
      await tx.playerAchievement.deleteMany({ where: { userId: u!.id } });
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Reset failed. Confirmation is required." },
      { status: 400 },
    );
  }
}
