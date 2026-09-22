import { z } from "zod";
import {
  initialState,
  parseState,
  playerCase,
  reduceAction,
  actionSchema,
} from "../../lib/engine";
import { RANKS, rankFor } from "../../lib/constants";
import { catalog } from "../../data/catalog";
import type { GameState, ProfileData } from "../../types/game";
import { offlineCase } from "./cases";
const settingsSchema = z.object({
  muted: z.boolean(),
  soundVolume: z.number().int().min(0).max(100),
  musicVolume: z.number().int().min(0).max(100),
  textSize: z.enum(["normal", "large"]),
  reducedMotion: z.boolean(),
  tutorialDone: z.boolean(),
});
interface SavedCase {
  state: GameState;
  version: number;
  updatedAt: string;
}
export interface OfflineSave {
  schemaVersion: 1;
  username: string;
  settings: z.infer<typeof settingsSchema>;
  cases: Record<string, SavedCase>;
  achievements: string[];
}
export const freshSave = (): OfflineSave => ({
  schemaVersion: 1,
  username: "Detective",
  settings: {
    muted: true,
    soundVolume: 50,
    musicVolume: 25,
    textSize: "normal",
    reducedMotion: false,
    tutorialDone: false,
  },
  cases: {},
  achievements: [],
});
export function profileFor(save: OfflineSave): ProfileData {
  const entries = Object.entries(save.cases);
  const solved = entries.filter(([, p]) => p.state.solved);
  const xp = solved.reduce((n, [, p]) => n + (p.state.report?.score ?? 0), 0);
  const frequency: Record<string, number> = {};
  for (const [id] of solved) {
    const category = catalog.find((c) => c.id === id)!.category;
    frequency[category] = (frequency[category] ?? 0) + 1;
  }
  return {
    username: save.username,
    xp,
    rank: rankFor(xp),
    nextRank: RANKS.find((r) => r.xp > xp) ?? null,
    solved: solved.length,
    attempted: entries.length,
    accuracy: solved.length
      ? Math.round(
          solved.reduce((n, [, p]) => n + (p.state.report?.accuracy ?? 0), 0) /
            solved.length,
        )
      : 0,
    evidence: entries.reduce((n, [, p]) => n + p.state.discovered.length, 0),
    hints: entries.reduce((n, [, p]) => n + p.state.hints.length, 0),
    time: entries.reduce((n, [, p]) => n + p.state.elapsed, 0),
    perfect: solved.filter(([, p]) => p.state.report?.score === 1000).length,
    favorite:
      Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "Not established",
    achievements: [...save.achievements],
    progress: entries
      .sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt))
      .map(([caseId, p]) => ({
        caseId,
        status: p.state.solved ? "solved" : "active",
        updatedAt: p.updatedAt,
        score: p.state.report?.score ?? null,
      })),
  };
}
export class LocalError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
// Runs synchronously inside one IndexedDB read/write transaction. An action,
// its save version, score and achievements either all persist or none do.
export function dispatch(
  save: OfflineSave,
  path: string,
  method: string,
  body: unknown,
): unknown {
  if (save.schemaVersion !== 1)
    throw new Error(
      "This save needs a newer version of CASEFILE. Update the app; do not clear its data.",
    );
  if (path === "/api/profile") {
    if (method === "POST")
      save.username = z
        .object({ username: z.string().trim().min(2).max(32) })
        .parse(body).username;
    else if (method !== "GET")
      throw new LocalError("Unsupported operation.", 405);
    return profileFor(save);
  }
  if (path === "/api/settings") {
    if (method === "GET") return save.settings;
    if (method === "POST") {
      save.settings = {
        ...save.settings,
        ...settingsSchema.partial().parse(body),
      };
      return save.settings;
    }
    if (method === "DELETE") {
      const request = z
        .object({
          confirmation: z.literal("RESET"),
          caseId: z.string().optional(),
        })
        .parse(body);
      if (request.caseId) {
        if (!offlineCase(request.caseId)) throw new LocalError("Unknown case.");
        delete save.cases[request.caseId];
      } else save.cases = {};
      save.achievements = [];
      return { ok: true };
    }
    throw new LocalError("Unsupported operation.", 405);
  }
  const id = /^\/api\/game\/(\d{3})$/.exec(path)?.[1];
  const entry = id ? offlineCase(id) : undefined;
  if (!entry || !id) throw new LocalError("This case does not exist.", 404);
  let saved = save.cases[id];
  if (method === "GET") {
    if (!saved)
      saved = save.cases[id] = {
        state: initialState(),
        version: 0,
        updatedAt: new Date().toISOString(),
      };
    const state = parseState(JSON.stringify(saved.state));
    return {
      case: playerCase(entry.case, state),
      state,
      version: saved.version,
    };
  }
  if (method !== "POST") throw new LocalError("Unsupported operation.", 405);
  const request = z
    .object({ version: z.number().int().min(0), action: actionSchema })
    .parse(body);
  if (!saved) throw new LocalError("Open this case before taking an action.");
  if (request.version !== saved.version)
    throw new LocalError(
      "This save changed. The latest progress has been loaded; repeat your action.",
      409,
    );
  const previous = parseState(JSON.stringify(saved.state));
  const { state, feedback } = reduceAction(
    entry.case,
    entry.solution,
    previous,
    request.action,
  );
  if (state.solved && !previous.solved) {
    const before = profileFor(save);
    state.report!.previousRank = before.rank;
    state.report!.rank = rankFor(before.xp + state.report!.score);
    const other = Object.entries(save.cases).filter(([key]) => key !== id);
    const totalContradictions =
      state.contradictions.length +
      other.reduce((n, [, p]) => n + p.state.contradictions.length, 0);
    const cold =
      other.filter(
        ([key, p]) =>
          p.state.solved && offlineCase(key)!.case.category === "Cold Case",
      ).length + (entry.case.category === "Cold Case" ? 1 : 0);
    save.achievements = [
      ...new Set([
        ...save.achievements,
        "first",
        ...(state.report!.score === 1000 ? ["perfect"] : []),
        ...(state.hints.length === 0 ? ["unaided"] : []),
        ...(state.discovered.length === entry.case.evidence.length
          ? ["evidence"]
          : []),
        ...(totalContradictions >= 25 ? ["contradictions"] : []),
        ...(cold >= 10 ? ["cold"] : []),
        ...(before.solved + 1 >= 50 ? ["master"] : []),
        ...(before.solved + 1 >= catalog.length ? ["legend"] : []),
      ]),
    ];
  }
  save.cases[id] = {
    state,
    version: saved.version + 1,
    updatedAt: new Date().toISOString(),
  };
  return {
    case: playerCase(entry.case, state),
    state,
    version: saved.version + 1,
    feedback,
  };
}
export interface LocalDatabase {
  run(path: string, method: string, body?: unknown): Promise<unknown>;
  close(): Promise<void>;
}
export function createLocalDatabase(
  name = "casefile-offline-v1",
  factory: IDBFactory = indexedDB,
): LocalDatabase {
  let connection: Promise<IDBDatabase> | undefined;
  const open = () =>
    (connection ??= new Promise((resolve, reject) => {
      const request = factory.open(name, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("player");
      request.onsuccess = () => {
        request.result.onversionchange = () => {
          request.result.close();
          connection = undefined;
        };
        resolve(request.result);
      };
      request.onerror = () => {
        connection = undefined;
        reject(
          new Error(
            "Device storage could not be opened. Restart the app and check available storage.",
          ),
        );
      };
      request.onblocked = () => {
        reject(
          new Error(
            "Another window is using this save. Close it and restart the app.",
          ),
        );
      };
    }));
  return {
    async run(path, method, body) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("player", "readwrite");
        const store = tx.objectStore("player");
        let result: unknown;
        let failure: unknown;
        const read = store.get("save");
        read.onsuccess = () => {
          try {
            const save = (read.result ?? freshSave()) as OfflineSave;
            result = dispatch(save, path, method, body);
            store.put(save, "save");
          } catch (error) {
            failure = error;
            tx.abort();
          }
        };
        tx.oncomplete = () => resolve(result);
        tx.onabort = () =>
          reject(
            failure ??
              new Error(
                "Progress could not be saved on this device. Free some storage and retry.",
              ),
          );
        tx.onerror = () => {
          /* onabort reports the failure without acknowledging an unsaved action. */
        };
      });
    },
    async close() {
      if (connection) (await connection).close();
      connection = undefined;
    },
  };
}
