import test from "node:test";
import assert from "node:assert/strict";
import { IDBFactory } from "fake-indexeddb";
import {
  createLocalDatabase,
  LocalError,
  freshSave,
  dispatch,
} from "../src/store";
import { offlineCases } from "../src/cases";
import { catalog } from "../../data/catalog";
import { hasRequirements, locationOpen, type Action } from "../../lib/engine";
import type { GamePayload, ProfileData } from "../../types/game";
const factory = new IDBFactory();
test("all 150 cases solve and persist locally without a server", async () => {
  const db = createLocalDatabase("all-cases", factory);
  // Exercise every action against storage with one case at a time. Keeping all
  // completed files in every fake-IDB transaction creates quadratic clone work.
  // Separately retain real solved states to verify cumulative rewards and saves.
  const aggregate = freshSave();
  assert.equal(offlineCases.length, 150);
  assert.deepEqual(
    offlineCases.map((e) => e.case.id).sort(),
    catalog.map((c) => c.id).sort(),
  );
  for (const { case: c, solution } of offlineCases) {
    let game = (await db.run(`/api/game/${c.id}`, "GET")) as GamePayload;
    assert.ok(game.case.evidence.every((e) => !e.analysis));
    const act = async (action: Action) => {
      game = (await db.run(`/api/game/${c.id}`, "POST", {
        version: game.version,
        action,
      })) as GamePayload;
    };
    for (let pass = 0; pass < 5; pass++) {
      for (const l of c.locations) {
        if (!locationOpen(c, game.state, l.id)) continue;
        if (!game.state.visited.includes(l.id))
          await act({ type: "visit", id: l.id });
        for (const h of l.hotspots) {
          if (!game.state.discovered.includes(h.evidenceId))
            await act({ type: "discover", id: h.evidenceId });
          if (!game.state.analyzed.includes(h.evidenceId))
            await act({ type: "analyze", id: h.evidenceId });
        }
      }
      for (const p of c.suspects)
        for (const q of p.questions)
          if (
            !game.state.interviews.includes(q.id) &&
            hasRequirements(game.state, q.requires)
          )
            await act({ type: "interview", id: q.id });
      for (const d of c.deductions)
        if (
          !game.state.deductions.includes(d.id) &&
          hasRequirements(game.state, d.requires)
        )
          await act({
            type: "deduce",
            id: d.id,
            answer: solution.deductions[d.id],
          });
    }
    for (const x of solution.contradictions)
      await act({ type: "connect", pair: x.pair, contradiction: true });
    await act({ type: "timeline", order: solution.timelineOrder });
    const theory: Action = {
      type: "theory",
      answers: solution.answers,
      proof: solution.proof,
    };
    aggregate.cases[c.id] = {
      state: structuredClone(game.state),
      version: game.version,
      updatedAt: new Date().toISOString(),
    };
    const combined = dispatch(aggregate, `/api/game/${c.id}`, "POST", {
      version: game.version,
      action: theory,
    }) as GamePayload;
    assert.equal(combined.state.report?.score, 1000);
    await act(theory);
    assert.equal(game.state.report?.score, 1000, `Case ${c.id}`);
    assert.equal(game.state.solved, true, `Case ${c.id}`);
    await db.close();
    const check = createLocalDatabase("all-cases", factory);
    assert.deepEqual(
      ((await check.run(`/api/game/${c.id}`, "GET")) as GamePayload).state,
      game.state,
    );
    await check.run("/api/settings", "DELETE", { confirmation: "RESET" });
    await check.close();
  }
  await db.close();
  // Seed the full-profile persistence fixture using actual solutions above.
  // This is test-only storage access, never an application import endpoint.
  await new Promise<void>((resolve, reject) => {
    const request = factory.open("all-cases", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const connection = request.result;
      const tx = connection.transaction("player", "readwrite");
      tx.objectStore("player").put(aggregate, "save");
      tx.oncomplete = () => {
        connection.close();
        resolve();
      };
      tx.onabort = () => {
        connection.close();
        reject(tx.error);
      };
    };
  });
  const reopened = createLocalDatabase("all-cases", factory);
  const p = (await reopened.run("/api/profile", "GET")) as ProfileData;
  assert.equal(p.solved, 150);
  assert.equal(p.xp, 150000);
  assert.ok(p.achievements.includes("legend"));
  for (const c of catalog) {
    const game = (await reopened.run(
      `/api/game/${c.id}`,
      "GET",
    )) as GamePayload;
    assert.equal(game.state.solved, true);
    assert.equal(game.state.report?.score, 1000);
  }
  await reopened.close();
});
test("local transactions prevent lost updates, preserve notes/settings and scope resets", async () => {
  const a = createLocalDatabase("concurrency", factory);
  const b = createLocalDatabase("concurrency", factory);
  await a.run("/api/game/150", "GET");
  await a.run("/api/game/012", "GET");
  const results = await Promise.allSettled([
    a.run("/api/game/150", "POST", {
      version: 0,
      action: { type: "note", id: "one", text: "Keep this note" },
    }),
    b.run("/api/game/150", "POST", { version: 0, action: { type: "hint" } }),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const rejected = results.find(
    (r) => r.status === "rejected",
  ) as PromiseRejectedResult;
  assert.ok(rejected.reason instanceof LocalError);
  assert.equal(rejected.reason.status, 409);
  await a.run("/api/profile", "POST", { username: "Offline Detective" });
  await a.run("/api/settings", "POST", {
    textSize: "large",
    tutorialDone: true,
  });
  await a.close();
  await b.close();
  const c = createLocalDatabase("concurrency", factory);
  const before = (await c.run("/api/game/150", "GET")) as GamePayload;
  await assert.rejects(
    c.run("/api/game/150", "POST", {
      version: before.version,
      action: { type: "discover", id: "finding" },
    }),
  );
  assert.deepEqual(
    ((await c.run("/api/game/150", "GET")) as GamePayload).state,
    before.state,
  );
  await assert.rejects(
    c.run("/api/settings", "DELETE", { confirmation: "no" }),
  );
  await c.run("/api/settings", "DELETE", {
    confirmation: "RESET",
    caseId: "012",
  });
  assert.deepEqual(
    ((await c.run("/api/game/150", "GET")) as GamePayload).state,
    before.state,
  );
  const p = (await c.run("/api/profile", "GET")) as ProfileData;
  assert.equal(p.username, "Offline Detective");
  assert.equal(p.attempted, 1);
  assert.equal(
    ((await c.run("/api/settings", "GET")) as { textSize: string }).textSize,
    "large",
  );
  await c.run("/api/settings", "DELETE", { confirmation: "RESET" });
  assert.equal(
    ((await c.run("/api/profile", "GET")) as ProfileData).attempted,
    0,
  );
  await c.close();
});
test("UI transport works even when every network request is forbidden", async () => {
  const oldFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "indexedDB", {
    configurable: true,
    value: new IDBFactory(),
  });
  globalThis.fetch = async () => {
    throw new Error("Network forbidden");
  };
  try {
    const { gameRequest } = await import("../src/client");
    for (const path of [
      "/api/profile",
      "/api/settings",
      "/api/game/001",
      "/api/game/100",
      "/api/game/150",
    ]) {
      const r = await gameRequest(path);
      assert.equal(r.status, 200, path);
    }
    const changed = await gameRequest("/api/game/150", {
      method: "POST",
      body: JSON.stringify({
        version: 0,
        action: { type: "note", id: "offline", text: "Airplane mode" },
      }),
    });
    assert.equal(changed.status, 200);
    assert.equal((await changed.json()).state.notes[0].text, "Airplane mode");
  } finally {
    globalThis.fetch = oldFetch;
  }
});
