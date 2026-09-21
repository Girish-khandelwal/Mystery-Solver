import { PrismaClient } from "@prisma/client";
import { catalog } from "../data/catalog";
import { ACHIEVEMENTS, RANKS } from "../lib/constants";
import { randomBytes } from "node:crypto";
const db = new PrismaClient();
async function main() {
  const metadata = catalog.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    title: c.title,
    category: c.category,
    difficulty: c.difficulty,
    contentStatus: c.contentStatus,
  }));
  const existing = await db.case.findMany();
  const byId = new Map(existing.map((c) => [c.id, c]));
  const missing = metadata.filter((c) => !byId.has(c.id));
  if (missing.length) await db.case.createMany({ data: missing });
  for (const c of metadata) {
    const old = byId.get(c.id);
    if (
      old &&
      (old.title !== c.title ||
        old.category !== c.category ||
        old.difficulty !== c.difficulty ||
        old.contentStatus !== c.contentStatus)
    )
      await db.case.update({ where: { id: c.id }, data: c });
  }
  console.log(
    `Case catalog synchronized: ${missing.length} new, ${metadata.length} total.`,
  );
  for (const a of ACHIEVEMENTS)
    await db.achievement.upsert({ where: { id: a.id }, create: a, update: a });
  for (const r of RANKS)
    await db.detectiveRank.upsert({
      where: { name: r.name },
      create: { name: r.name, minimumXp: r.xp },
      update: { minimumXp: r.xp },
    });
  if (!(await db.user.findFirst({ where: { username: "Detective" } })))
    await db.user.create({
      data: {
        username: "Detective",
        sessionToken: randomBytes(32).toString("hex"),
        profile: { create: {} },
        settings: { create: {} },
      },
    });
  console.log(
    `Seeded ${catalog.length} case entries, ${ACHIEVEMENTS.length} achievements and ${RANKS.length} ranks.`,
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
