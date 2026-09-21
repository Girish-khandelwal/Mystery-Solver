import { archiveEpisodes } from "../data/cases/archive";
import { easyEpisodes } from "../data/cases/easy";
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { catalog } from "../data/catalog";
import { clockmaker } from "../data/cases/clockmaker";
import { clockmakerSolution } from "../data/cases/solutions";
import { additionalEpisodes } from "../data/cases/episodes";
import {
  initialState,
  reduceAction,
  playerCase,
  hasRequirements,
  locationOpen,
  parseState,
} from "../lib/engine";
import type { Action } from "../lib/engine";
const entries = [
  { case: clockmaker, solution: clockmakerSolution },
  ...additionalEpisodes,
  ...archiveEpisodes,
  ...easyEpisodes,
];
test("150 unique catalog entries with honest authored status and assets", () => {
  assert.equal(catalog.length, 150);
  assert.equal(new Set(catalog.map((c) => c.id)).size, 150);
  assert.equal(
    catalog.filter((c) => c.contentStatus === "playable").length,
    150,
  );
  assert.equal(catalog.filter((c) => c.difficulty === "Easy").length, 50);
  assert.deepEqual(
    easyEpisodes.map((e) => e.case.id),
    Array.from({ length: 50 }, (_, i) => String(101 + i)),
  );
  assert.ok(
    easyEpisodes.every(
      (e) =>
        e.case.difficulty === "Easy" && e.case.contentStatus === "playable",
    ),
  );
  for (const c of catalog) assert.ok(existsSync("public" + c.coverImage));
});
for (const { case: c, solution } of entries)
  test(`${c.id}: content graph has a reachable complete, perfect solution`, () => {
    let s = initialState();
    const act = (a: Action) => {
      s = reduceAction(c, solution, s, a).state;
    };
    for (let pass = 0; pass < 5; pass++) {
      for (const l of c.locations) {
        if (!locationOpen(c, s, l.id)) continue;
        act({ type: "visit", id: l.id });
        for (const h of l.hotspots) {
          act({ type: "discover", id: h.evidenceId });
          act({ type: "analyze", id: h.evidenceId });
        }
      }
      for (const p of c.suspects)
        for (const q of p.questions)
          if (hasRequirements(s, q.requires))
            act({ type: "interview", id: q.id });
      for (const d of c.deductions)
        if (!s.deductions.includes(d.id) && hasRequirements(s, d.requires))
          act({ type: "deduce", id: d.id, answer: solution.deductions[d.id] });
    }
    assert.equal(s.discovered.length, c.evidence.length);
    assert.equal(s.deductions.length, c.deductions.length);
    for (const x of solution.contradictions)
      act({ type: "connect", pair: x.pair, contradiction: true });
    act({ type: "timeline", order: solution.timelineOrder });
    act({ type: "theory", answers: solution.answers, proof: solution.proof });
    assert.equal(s.solved, true);
    assert.equal(s.report?.score, 1000);
    assert.ok(s.report?.explanation.length);
    assert.deepEqual(parseState(JSON.stringify(s)), s);
  });
test("hidden analysis, interview responses, and solution are not in initial payload", () => {
  const c = playerCase(clockmaker, initialState());
  assert.ok(c.evidence.every((e) => e.analysis === undefined));
  assert.ok(c.suspects.every((s) => s.questions.every((q) => q.answer === "")));
  assert.ok(!("solution" in c));
  assert.ok(!("answers" in c));
  assert.ok(
    !JSON.stringify(c).includes(clockmakerSolution.explanation[0].text),
  );
});
test("gates cannot be bypassed by forged client actions", () => {
  const s = initialState();
  for (const action of [
    { type: "discover", id: "tool" },
    { type: "visit", id: "lab" },
    { type: "analyze", id: "tool" },
    { type: "interview", id: "leon-print" },
    { type: "deduce", id: "time", answer: clockmakerSolution.deductions.time },
    {
      type: "theory",
      answers: clockmakerSolution.answers,
      proof: clockmakerSolution.proof,
    },
  ] as Action[])
    assert.throws(() =>
      reduceAction(clockmaker, clockmakerSolution, s, action),
    );
});
test("hints cap at three, incorrect deductions penalize, notes edit and delete", () => {
  let s = initialState();
  const act = (a: Action) => {
    s = reduceAction(clockmaker, clockmakerSolution, s, a).state;
  };
  for (let i = 0; i < 8; i++) act({ type: "hint" });
  assert.equal(s.hints.length, 3);
  act({ type: "note", id: "n", text: "First" });
  act({ type: "note", id: "n", text: "Revised" });
  assert.equal(s.notes.length, 1);
  assert.equal(s.notes[0].text, "Revised");
  act({ type: "note", id: "n", text: "" });
  assert.equal(s.notes.length, 0);
  assert.throws(() => parseState("{broken"));
});
test("client chunks do not contain private reconstruction prose", () => {
  const dir = ".next/static/chunks";
  if (!existsSync(dir)) return;
  const walk = (d: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(d + "/" + e.name) : [d + "/" + e.name],
    );
  const code = walk(dir)
    .filter((p) => p.endsWith(".js"))
    .map((p) => readFileSync(p, "utf8"))
    .join("");
  for (const entry of entries)
    assert.ok(!code.includes(entry.solution.explanation[0].text));
  assert.ok(!code.includes("clockmakerSolution"));
});
