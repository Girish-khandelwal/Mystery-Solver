import type {
  GameState,
  MysteryCase,
  SecretSolution,
  CaseReport,
} from "@/types/game";
import { z } from "zod";
export const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("visit"), id: z.string() }),
  z.object({ type: z.literal("discover"), id: z.string() }),
  z.object({ type: z.literal("analyze"), id: z.string() }),
  z.object({ type: z.literal("interview"), id: z.string() }),
  z.object({ type: z.literal("deduce"), id: z.string(), answer: z.string() }),
  z.object({
    type: z.literal("connect"),
    pair: z.tuple([z.string(), z.string()]),
    contradiction: z.boolean(),
  }),
  z.object({ type: z.literal("timeline"), order: z.array(z.string()).max(30) }),
  z.object({
    type: z.literal("note"),
    id: z.string().max(80),
    text: z.string().max(5000),
  }),
  z.object({ type: z.literal("pin"), id: z.string() }),
  z.object({ type: z.literal("hint") }),
  z.object({
    type: z.literal("tick"),
    seconds: z.number().int().min(0).max(60),
  }),
  z.object({
    type: z.literal("theory"),
    answers: z.record(z.string(), z.string().max(1000)),
    proof: z.array(z.string()).max(30),
  }),
]);
export type Action = z.infer<typeof actionSchema>;
export const initialState = (): GameState => ({
  discovered: [],
  analyzed: [],
  visited: [],
  interviews: [],
  deductions: [],
  contradictions: [],
  connections: [],
  timeline: [],
  timelineCorrect: false,
  notes: [],
  pins: [],
  hints: [],
  wrongDeductions: 0,
  wrongAccusations: 0,
  elapsed: 0,
  solved: false,
});
export function parseState(raw: string): GameState {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object")
    throw new Error(
      "The saved file cannot be read. Restore it from a backup or reset this case in Settings.",
    );
  const s = { ...initialState(), ...parsed } as GameState;
  for (const key of [
    "discovered",
    "analyzed",
    "visited",
    "interviews",
    "deductions",
    "contradictions",
    "connections",
    "timeline",
    "notes",
    "pins",
    "hints",
  ] as const)
    if (!Array.isArray(s[key]))
      throw new Error(
        "The saved file is damaged. Reset this case in Settings.",
      );
  return s;
}
export const hasRequirements = (s: GameState, ids: string[] = []) =>
  ids.every((id) => s.analyzed.includes(id));
export const locationOpen = (c: MysteryCase, s: GameState, id: string) => {
  const l = c.locations.find((l) => l.id === id);
  return (
    !!l &&
    hasRequirements(s, l.requires) &&
    (!l.deductionRequired || s.deductions.includes(l.deductionRequired))
  );
};
const add = (arr: string[], id: string) => {
  if (!arr.includes(id)) arr.push(id);
};
function requireCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}
export function reduceAction(
  c: MysteryCase,
  secret: SecretSolution,
  previous: GameState,
  action: Action,
): { state: GameState; feedback: string } {
  const s = structuredClone(previous);
  let feedback = "Case file saved.";
  requireCondition(
    !s.solved || ["note", "pin", "tick"].includes(action.type),
    "This investigation is closed. Reset the case to investigate again.",
  );
  switch (action.type) {
    case "visit":
      requireCondition(
        locationOpen(c, s, action.id),
        "This location is not yet available. Analyze its lead first.",
      );
      add(s.visited, action.id);
      break;
    case "discover": {
      const e = c.evidence.find((e) => e.id === action.id);
      requireCondition(
        e &&
          locationOpen(c, s, e.locationId) &&
          s.visited.includes(e.locationId),
        "Visit the location before collecting evidence.",
      );
      add(s.discovered, action.id);
      feedback = "Evidence secured. Open it to request analysis.";
      break;
    }
    case "analyze":
      requireCondition(
        s.discovered.includes(action.id),
        "Collect this evidence first.",
      );
      add(s.analyzed, action.id);
      feedback = "Analysis complete. New leads may now be available.";
      break;
    case "interview": {
      const q = c.suspects
        .flatMap((s) => s.questions)
        .find((q) => q.id === action.id);
      requireCondition(
        q && hasRequirements(s, q.requires),
        "Analyze the supporting evidence to ask this question.",
      );
      add(s.interviews, q.id);
      feedback = "Statement added to the case file.";
      break;
    }
    case "deduce": {
      const d = c.deductions.find((d) => d.id === action.id);
      requireCondition(
        d &&
          hasRequirements(s, d.requires) &&
          d.options.includes(action.answer),
        "This deduction is unavailable.",
      );
      requireCondition(
        !s.deductions.includes(d.id),
        "This deduction has already been established.",
      );
      if (secret.deductions[d.id] === action.answer) {
        add(s.deductions, d.id);
        feedback = "Deduction established. Check for new investigation paths.";
      } else {
        s.wrongDeductions++;
        feedback =
          "That conclusion is not supported by the evidence. −15 points.";
      }
      break;
    }
    case "connect": {
      const allowed = [
        ...s.discovered,
        ...s.interviews,
        ...c.suspects.map((x) => x.id),
        ...s.visited,
        ...c.timeline
          .filter((t) => hasRequirements(s, t.requires))
          .map((t) => t.id),
        ...c.witnesses
          .filter((w) => hasRequirements(s, w.requires))
          .map((w) => w.id),
      ];
      requireCondition(
        action.pair[0] !== action.pair[1] &&
          action.pair.every((id) => allowed.includes(id)),
        "Choose two different discovered facts.",
      );
      if (!s.connections.some((p) => p.every((id) => action.pair.includes(id))))
        s.connections.push(action.pair);
      if (action.contradiction) {
        const match = secret.contradictions.find((x) =>
          x.pair.every((id) => action.pair.includes(id)),
        );
        if (match) {
          requireCondition(
            match.pair
              .filter((id) => c.evidence.some((e) => e.id === id))
              .every((id) => s.analyzed.includes(id)),
            "Analyze the evidence first.",
          );
          add(s.contradictions, match.id);
          feedback = match.explanation;
        } else {
          s.wrongDeductions++;
          feedback =
            "No provable contradiction between these facts. −15 points.";
        }
      } else feedback = "Connection pinned to your board.";
      break;
    }
    case "timeline":
      requireCondition(
        action.order.length === c.timeline.length &&
          new Set(action.order).size === c.timeline.length &&
          c.timeline.every(
            (t) =>
              action.order.includes(t.id) && hasRequirements(s, t.requires),
          ),
        "Discover and analyze every timeline source before submitting the order.",
      );
      s.timeline = action.order;
      s.timelineCorrect = secret.timelineOrder.every(
        (id, i) => id === action.order[i],
      );
      feedback = s.timelineCorrect
        ? "Chronology corroborated."
        : "The chronology is inconsistent. Review the original timestamps.";
      if (!s.timelineCorrect) s.wrongDeductions++;
      break;
    case "note":
      s.notes = s.notes.filter((n) => n.id !== action.id);
      if (action.text.trim())
        s.notes.push({ id: action.id, text: action.text.trim() });
      break;
    case "pin":
      requireCondition(
        [...s.discovered, ...c.suspects.map((x) => x.id)].includes(action.id),
        "Only known evidence or suspects can be pinned.",
      );
      s.pins = s.pins.includes(action.id)
        ? s.pins.filter((id) => id !== action.id)
        : [...s.pins, action.id];
      break;
    case "hint":
      if (s.hints.length < secret.hints.length) {
        s.hints.push(secret.hints[s.hints.length]);
        feedback = "Hint recorded. −25 points.";
      } else feedback = "All available hints are in your notebook.";
      break;
    case "tick":
      s.elapsed += action.seconds;
      break;
    case "theory": {
      requireCondition(
        c.finalQuestions.every((q) => q.options.includes(action.answers[q.id])),
        "Complete every part of your theory.",
      );
      requireCondition(
        action.proof.every((id) => s.analyzed.includes(id)),
        "Only analyzed evidence can support your theory.",
      );
      requireCondition(
        s.deductions.length >= Math.min(2, c.deductions.length) &&
          s.timelineCorrect,
        "Establish at least two deductions and corroborate the timeline before submitting.",
      );
      const correct = c.finalQuestions.filter(
        (q) => secret.answers[q.id] === action.answers[q.id],
      ).length;
      const proven = secret.proof.every((id) => action.proof.includes(id));
      const solved = correct === c.finalQuestions.length && proven;
      if (!solved) s.wrongAccusations++;
      s.solved = solved;
      const score = Math.max(
        0,
        Math.min(
          1000,
          Math.round(
            (600 * correct) / c.finalQuestions.length +
              (150 * s.discovered.length) / c.evidence.length +
              (100 * s.contradictions.length) /
                Math.max(1, secret.contradictions.length) +
              (s.timelineCorrect ? 100 : 0) +
              50 -
              s.hints.length * 25 -
              s.wrongAccusations * 75 -
              s.wrongDeductions * 15,
          ),
        ),
      );
      s.report = {
        solved,
        score,
        accuracy: Math.round(
          (100 * (correct + (proven ? 1 : 0))) / (c.finalQuestions.length + 1),
        ),
        grade:
          score >= 900 ? "A" : score >= 750 ? "B" : score >= 600 ? "C" : "D",
        evidenceFound: s.discovered.length,
        evidenceTotal: c.evidence.length,
        contradictionsFound: s.contradictions.length,
        contradictionsTotal: secret.contradictions.length,
        hints: s.hints.length,
        wrongDeductions: s.wrongDeductions,
        wrongAccusations: s.wrongAccusations,
        explanation: solved
          ? secret.explanation
          : [
              {
                title: "The theory is not established",
                text: "At least one conclusion or your supporting evidence is incomplete. Revisit the independent records and compare statements. No individual answer has been marked, and the case remains open.",
              },
            ],
        previousRank: "",
        rank: "",
      };
      feedback = solved
        ? "Case solved. The full reconstruction is now available."
        : "Theory rejected. Investigation remains open. −75 points.";
      break;
    }
  }
  return { state: s, feedback };
}
export function playerCase(c: MysteryCase, s: GameState): MysteryCase {
  return {
    ...c,
    evidence: c.evidence.map((e) => ({
      ...e,
      relatedSuspects: s.analyzed.includes(e.id) ? e.relatedSuspects : [],
      description: s.discovered.includes(e.id)
        ? e.description
        : "Inspect this object at the scene.",
      analysis: s.analyzed.includes(e.id) ? e.analysis : undefined,
    })),
    suspects: c.suspects.map((p) => ({
      ...p,
      questions: p.questions.map((q) => ({
        ...q,
        answer: s.interviews.includes(q.id) ? q.answer : "",
        contradiction: undefined,
      })),
    })),
  };
}
export const investigationStage = (s: GameState) =>
  s.solved
    ? "Case closed"
    : s.timelineCorrect && s.deductions.length >= 2
      ? "Building final theory"
      : s.deductions.length
        ? "Strong evidence"
        : s.discovered.length > 2
          ? "Developing leads"
          : "Initial inquiry";
