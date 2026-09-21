import { catalog } from "../data/catalog";
import { easyEpisodes } from "../data/cases/easy";
// Uses a new isolated cookie jar, never the browser user's profile.
import assert from "node:assert/strict";
import { clockmaker } from "../data/cases/clockmaker";
import { clockmakerSolution as solution } from "../data/cases/solutions";
import type { GamePayload } from "../types/game";
import type { Action } from "../lib/engine";
import { hasRequirements, locationOpen } from "../lib/engine";
const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
let cookie = "";
async function request(path: string, method = "GET", body?: unknown) {
  const r = await fetch(base + path, {
    method,
    headers: { cookie, origin: base, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const set = r.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  return { status: r.status, data: await r.json() };
}
async function main() {
  const p = await request("/api/profile");
  assert.equal(p.status, 200);
  assert.equal(p.data.solved, 0);
  // A brand-new detective can select every authored case without rank/XP gates.
  const openIds = catalog.map((c) => c.id);
  for (let offset = 0; offset < openIds.length; offset += 4) {
    await Promise.all(
      openIds.slice(offset, offset + 4).map(async (id) => {
        const opened = await request(`/api/game/${id}`);
        assert.equal(
          opened.status,
          200,
          `Level ${id} must be freely selectable`,
        );
      }),
    );
  }
  console.log(
    "Verified unrestricted selection of 150 cases with zero previous completions.",
  );
  assert.equal((await request("/api/game/151")).status, 400);
  let game = (await request("/api/game/001")).data as GamePayload;
  assert.equal(game.state.discovered.length, 0);
  const run = async (action: Action) => {
    const r = await request("/api/game/001", "POST", {
      version: game.version,
      action,
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    game = r.data;
  };
  const invalid = await request("/api/game/001", "POST", {
    version: game.version,
    action: { type: "discover", id: "tool" },
  });
  assert.equal(invalid.status, 400);
  await run({ type: "visit", id: "workshop" });
  const oldVersion = game.version;
  await run({ type: "discover", id: "clock" });
  assert.equal(
    (
      await request("/api/game/001", "POST", {
        version: oldVersion,
        action: { type: "analyze", id: "clock" },
      })
    ).status,
    409,
  );
  game = (await request("/api/game/001")).data;
  assert.ok(game.state.discovered.includes("clock"));
  await run({
    type: "note",
    id: "test-note",
    text: "Check the independent timestamp.",
  });
  assert.equal(
    (await request("/api/game/001")).data.state.notes[0].text,
    "Check the independent timestamp.",
  );
  for (let pass = 0; pass < 4; pass++) {
    for (const l of clockmaker.locations) {
      if (!locationOpen(clockmaker, game.state, l.id)) continue;
      if (!game.state.visited.includes(l.id))
        await run({ type: "visit", id: l.id });
      for (const h of l.hotspots) {
        if (!game.state.discovered.includes(h.evidenceId))
          await run({ type: "discover", id: h.evidenceId });
        if (!game.state.analyzed.includes(h.evidenceId))
          await run({ type: "analyze", id: h.evidenceId });
      }
    }
    for (const p of clockmaker.suspects)
      for (const q of p.questions)
        if (
          !game.state.interviews.includes(q.id) &&
          hasRequirements(game.state, q.requires)
        )
          await run({ type: "interview", id: q.id });
    for (const d of clockmaker.deductions)
      if (
        !game.state.deductions.includes(d.id) &&
        hasRequirements(game.state, d.requires)
      )
        await run({
          type: "deduce",
          id: d.id,
          answer: solution.deductions[d.id],
        });
  }
  for (const x of solution.contradictions)
    await run({ type: "connect", pair: x.pair, contradiction: true });
  await run({ type: "timeline", order: solution.timelineOrder });
  await run({
    type: "theory",
    answers: { ...solution.answers, culprit: "Mara Voss" },
    proof: solution.proof,
  });
  assert.equal(game.state.solved, false);
  assert.equal(game.state.report?.explanation.length, 1);
  assert.equal(game.state.wrongAccusations, 1);
  await run({
    type: "theory",
    answers: solution.answers,
    proof: solution.proof,
  });
  assert.equal(game.state.solved, true);
  assert.equal(game.state.report?.score, 925);
  const profile = (await request("/api/profile")).data;
  assert.equal(profile.solved, 1);
  assert.equal(profile.xp, 925);
  assert.ok(profile.achievements.includes("first"));
  assert.equal(profile.rank, "Junior Detective");
  assert.equal((await request("/api/game/006")).status, 200);
  assert.equal(
    (
      await request("/api/game/001", "POST", {
        version: game.version,
        action: {
          type: "theory",
          answers: solution.answers,
          proof: solution.proof,
        },
      })
    ).status,
    400,
  );
  assert.equal((await request("/api/profile")).data.xp, 925);
  console.log("Clockmaker solve, persistence, scoring and ranking passed.");
  // Solve a representative new Easy level through the same database-backed API.
  const easy = easyEpisodes[49];
  let easyGame = (await request(`/api/game/${easy.case.id}`))
    .data as GamePayload;
  const easyRun = async (action: Action) => {
    const r = await request(`/api/game/${easy.case.id}`, "POST", {
      version: easyGame.version,
      action,
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    easyGame = r.data;
  };
  for (let pass = 0; pass < 2; pass++) {
    for (const loc of easy.case.locations) {
      if (!locationOpen(easy.case, easyGame.state, loc.id)) continue;
      if (!easyGame.state.visited.includes(loc.id))
        await easyRun({ type: "visit", id: loc.id });
      for (const hotspot of loc.hotspots) {
        if (!easyGame.state.discovered.includes(hotspot.evidenceId))
          await easyRun({ type: "discover", id: hotspot.evidenceId });
        if (!easyGame.state.analyzed.includes(hotspot.evidenceId))
          await easyRun({ type: "analyze", id: hotspot.evidenceId });
      }
    }
  }
  for (const person of easy.case.suspects)
    for (const q of person.questions)
      await easyRun({ type: "interview", id: q.id });
  for (const deduction of easy.case.deductions)
    await easyRun({
      type: "deduce",
      id: deduction.id,
      answer: easy.solution.deductions[deduction.id],
    });
  for (const contradiction of easy.solution.contradictions)
    await easyRun({
      type: "connect",
      pair: contradiction.pair,
      contradiction: true,
    });
  await easyRun({ type: "timeline", order: easy.solution.timelineOrder });
  await easyRun({
    type: "theory",
    answers: easy.solution.answers,
    proof: easy.solution.proof,
  });
  assert.equal(easyGame.state.solved, true);
  assert.equal(easyGame.state.report?.score, 1000);
  assert.equal((await request("/api/profile")).data.solved, 2);
  assert.equal((await request("/api/profile")).data.xp, 1925);
  // Switching cases must not replace either saved investigation.
  assert.equal((await request("/api/game/001")).data.state.report.score, 925);
  assert.equal((await request("/api/game/150")).data.state.report.score, 1000);
  assert.equal(
    (await request("/api/settings", "DELETE", { confirmation: "wrong" }))
      .status,
    400,
  );
  assert.equal(
    (
      await request("/api/settings", "POST", {
        textSize: "large",
        muted: false,
      })
    ).status,
    200,
  );
  assert.equal((await request("/api/settings")).data.textSize, "large");
  assert.equal(
    (await request("/api/settings", "DELETE", { confirmation: "RESET" }))
      .status,
    200,
  );
  assert.equal((await request("/api/profile")).data.xp, 0);
  assert.equal((await request("/api/profile")).data.attempted, 0);
  console.log(
    "Integration passed: isolated session, gates, persistence, conflicts, every clockmaker exhibit, interviews, deductions, board contradictions, chronology, wrong/correct theory, score, rank, achievements, all 150 levels selectable without prior completion, full Easy-case solve, independent saves, settings, reset.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
