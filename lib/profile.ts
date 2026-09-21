import "server-only";
import { db } from "./db";
import { parseState } from "./engine";
import { RANKS, rankFor } from "./constants";
import { catalog } from "@/data/catalog";
export async function profileFor(userId: string) {
  const u = await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      profile: true,
      achievements: true,
      progress: { include: { result: true }, orderBy: { updatedAt: "desc" } },
    },
  });
  const states = u.progress
    .map((p) => {
      try {
        return parseState(p.state);
      } catch {
        return null;
      }
    })
    .filter((s) => s !== null);
  const solved = u.progress.filter((p) => p.status === "solved");
  const xp = u.profile?.xp ?? 0;
  const frequency: Record<string, number> = {};
  solved.forEach((p) => {
    const category = catalog.find((c) => c.id === p.caseId)?.category ?? "";
    frequency[category] = (frequency[category] ?? 0) + 1;
  });
  return {
    username: u.username,
    xp,
    rank: rankFor(xp),
    nextRank: RANKS.find((r) => r.xp > xp) ?? null,
    solved: solved.length,
    attempted: u.progress.length,
    accuracy: solved.length
      ? Math.round(
          solved.reduce((sum, p) => sum + (p.result?.accuracy ?? 0), 0) /
            solved.length,
        )
      : 0,
    evidence: states.reduce((n, s) => n + s.discovered.length, 0),
    hints: states.reduce((n, s) => n + s.hints.length, 0),
    time: states.reduce((n, s) => n + s.elapsed, 0),
    perfect: solved.filter((p) => p.result?.score === 1000).length,
    favorite:
      Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "Not established",
    achievements: u.achievements.map((a) => a.achievementId),
    progress: u.progress.map((p) => ({
      caseId: p.caseId,
      status: p.status,
      updatedAt: p.updatedAt.toISOString(),
      score: p.result?.score ?? null,
    })),
  };
}
