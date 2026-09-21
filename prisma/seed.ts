import { PrismaClient } from "@prisma/client";
import { catalog } from "../data/catalog";
import { ACHIEVEMENTS, RANKS } from "../lib/constants";
import { randomBytes } from "node:crypto";
const db = new PrismaClient();
async function main() {
  for (const c of catalog)
    await db.case.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        contentStatus: c.contentStatus,
      },
      update: { title: c.title, contentStatus: c.contentStatus },
    });
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
