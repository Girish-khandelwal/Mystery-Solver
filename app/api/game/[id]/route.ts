import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { session, assertOrigin } from "@/lib/session";
import { getCase } from "@/data/server-cases";
import {
  initialState,
  parseState,
  playerCase,
  reduceAction,
  actionSchema,
} from "@/lib/engine";
import { ACHIEVEMENTS, rankFor } from "@/lib/constants";
import { catalog } from "@/data/catalog";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
async function context(ctx: Context) {
  const { id } = await ctx.params;
  const entry = getCase(id);
  if (!entry)
    throw new Error("This case is not available for investigation yet.");
  const u = await session(true);
  return { entry, userId: u!.id, id };
}
export async function GET(_req: Request, ctx: Context) {
  try {
    const { entry, userId, id } = await context(ctx);
    const p = await db.caseProgress.upsert({
      where: { userId_caseId: { userId, caseId: id } },
      create: { userId, caseId: id, state: JSON.stringify(initialState()) },
      update: {},
    });
    const state = parseState(p.state);
    return NextResponse.json({
      case: playerCase(entry.case, state),
      state,
      version: p.version,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to open the case." },
      { status: 400 },
    );
  }
}
export async function POST(req: Request, ctx: Context) {
  try {
    assertOrigin(req);
    const body = z
      .object({ version: z.number().int().min(0), action: actionSchema })
      .parse(await req.json());
    const { entry, userId, id } = await context(ctx);
    const result = await db.$transaction(
      async (tx) => {
        const p = await tx.caseProgress.findUniqueOrThrow({
          where: { userId_caseId: { userId, caseId: id } },
        });
        if (p.version !== body.version) throw new Error("SAVE_CONFLICT");
        const previous = parseState(p.state);
        const { state, feedback } = reduceAction(
          entry.case,
          entry.solution,
          previous,
          body.action,
        );
        if (state.solved && p.status !== "solved") {
          const profile = await tx.playerProfile.findUniqueOrThrow({
            where: { userId },
          });
          state.report!.previousRank = rankFor(profile.xp);
          state.report!.rank = rankFor(profile.xp + state.report!.score);
          await tx.playerProfile.update({
            where: { userId },
            data: { xp: { increment: state.report!.score } },
          });
          await tx.caseResult.create({
            data: {
              progressId: p.id,
              score: state.report!.score,
              accuracy: state.report!.accuracy,
              report: JSON.stringify(state.report),
            },
          });
          const all = await tx.caseProgress.findMany({ where: { userId } });
          const solved = all.filter((x) => x.status === "solved");
          const count = solved.length + 1;
          const totalContradictions =
            all
              .filter((x) => x.id !== p.id)
              .reduce(
                (n, x) => n + parseState(x.state).contradictions.length,
                0,
              ) + state.contradictions.length;
          const cold =
            solved.filter(
              (x) =>
                catalog.find((c) => c.id === x.caseId)?.category ===
                "Cold Case",
            ).length + (entry.case.category === "Cold Case" ? 1 : 0);
          const earned = [
            "first",
            ...(state.report!.score === 1000 ? ["perfect"] : []),
            ...(state.hints.length === 0 ? ["unaided"] : []),
            ...(state.discovered.length === entry.case.evidence.length
              ? ["evidence"]
              : []),
            ...(totalContradictions >= 25 ? ["contradictions"] : []),
            ...(cold >= 10 ? ["cold"] : []),
            ...(count >= 50 ? ["master"] : []),
            ...(count >= catalog.length ? ["legend"] : []),
          ];
          for (const aid of earned) {
            const a = ACHIEVEMENTS.find((a) => a.id === aid)!;
            await tx.achievement.upsert({
              where: { id: aid },
              create: a,
              update: {},
            });
            await tx.playerAchievement.upsert({
              where: { userId_achievementId: { userId, achievementId: aid } },
              create: { userId, achievementId: aid },
              update: {},
            });
          }
        }
        const changed = await tx.caseProgress.updateMany({
          where: { id: p.id, version: body.version },
          data: {
            state: JSON.stringify(state),
            version: { increment: 1 },
            status: state.solved ? "solved" : "active",
          },
        });
        if (changed.count !== 1) throw new Error("SAVE_CONFLICT");
        // Persist only changed normalized records; re-writing the whole file makes remote saves grow with every clue.
        for (const eid of state.discovered.filter(
          (eid) =>
            !previous.discovered.includes(eid) ||
            state.analyzed.includes(eid) !== previous.analyzed.includes(eid),
        ))
          await tx.evidenceDiscovery.upsert({
            where: {
              progressId_evidenceId: { progressId: p.id, evidenceId: eid },
            },
            create: {
              progressId: p.id,
              evidenceId: eid,
              analyzed: state.analyzed.includes(eid),
            },
            update: { analyzed: state.analyzed.includes(eid) },
          });
        for (const lid of state.visited.filter(
          (lid) => !previous.visited.includes(lid),
        ))
          await tx.locationProgress.upsert({
            where: {
              progressId_locationId: { progressId: p.id, locationId: lid },
            },
            create: { progressId: p.id, locationId: lid },
            update: {},
          });
        for (const qid of state.interviews.filter(
          (qid) => !previous.interviews.includes(qid),
        ))
          await tx.interrogationProgress.upsert({
            where: {
              progressId_questionId: { progressId: p.id, questionId: qid },
            },
            create: { progressId: p.id, questionId: qid },
            update: {},
          });
        for (const did of state.deductions.filter(
          (did) => !previous.deductions.includes(did),
        ))
          await tx.deductionProgress.upsert({
            where: {
              progressId_deductionId: { progressId: p.id, deductionId: did },
            },
            create: { progressId: p.id, deductionId: did },
            update: {},
          });
        if (body.action.type === "note") {
          await tx.playerNote.deleteMany({ where: { progressId: p.id } });
          if (state.notes.length)
            await tx.playerNote.createMany({
              data: state.notes.map((n) => ({
                progressId: p.id,
                text: n.text,
              })),
            });
        }
        return {
          case: playerCase(entry.case, state),
          state,
          version: p.version + 1,
          feedback,
        };
      },
      { maxWait: 10000, timeout: 20000 },
    );
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unable to save the case.";
    return NextResponse.json(
      {
        error:
          msg === "SAVE_CONFLICT"
            ? "This case changed in another tab. The latest save has been loaded; repeat your action."
            : msg,
      },
      { status: msg === "SAVE_CONFLICT" ? 409 : 400 },
    );
  }
}
