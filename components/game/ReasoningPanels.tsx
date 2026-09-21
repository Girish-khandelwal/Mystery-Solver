"use client";
import { useState } from "react";
import {
  Pin,
  Link2,
  GitCompareArrows,
  LockKeyhole,
  Check,
  ArrowUp,
  ArrowDown,
  NotebookPen,
  Trash2,
  Save,
  Network,
} from "lucide-react";
import { hasRequirements } from "@/lib/engine";
import type { PanelProps } from "./Investigation";
export function BoardPanel({ data, act, busy }: PanelProps) {
  const [selection, setSelection] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const c = data.case,
    s = data.state;
  const cards = [
    ...c.evidence
      .filter((e) => s.discovered.includes(e.id))
      .map((e) => ({
        id: e.id,
        title: e.name,
        text: s.analyzed.includes(e.id)
          ? (e.analysis ?? e.description)
          : e.description,
        type: e.type,
      })),
    ...c.suspects.map((p) => ({
      id: p.id,
      title: p.name,
      text: p.alibi,
      type: "Suspects",
    })),
    ...c.suspects.flatMap((p) =>
      p.questions
        .filter((q) => s.interviews.includes(q.id))
        .map((q) => ({
          id: q.id,
          title: `${p.name} · statement`,
          text: q.answer,
          type: "Witness",
        })),
    ),
    ...c.locations
      .filter((l) => s.visited.includes(l.id))
      .map((l) => ({
        id: l.id,
        title: l.name,
        text: l.description,
        type: "Locations",
      })),
    ...c.timeline
      .filter((t) => hasRequirements(s, t.requires))
      .map((t) => ({
        id: t.id,
        title: t.title,
        text: t.description,
        type: "Timeline",
      })),
    ...c.witnesses
      .filter((w) => hasRequirements(s, w.requires))
      .map((w) => ({
        id: w.id,
        title: w.name,
        text: w.statement,
        type: "Witness",
      })),
  ];
  const visible = cards.filter(
    (c) =>
      (filter === "All" ||
        filter === c.type ||
        (filter === "Important" && s.pins.includes(c.id))) &&
      `${c.title} ${c.text}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Connect what others overlook.</h2>
          <p>
            Select two cards to draw a connection or challenge a contradiction.
          </p>
        </div>
        <span className="tag">
          {s.contradictions.length} CONTRADICTIONS ESTABLISHED
        </span>
      </div>
      <div className="board-toolbar">
        <input
          placeholder="Search your board…"
          aria-label="Search evidence board"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filter board"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {[
            "All",
            "Physical",
            "Digital",
            "Documents",
            "Forensic",
            "Witness",
            "Suspects",
            "Locations",
            "Timeline",
            "Important",
          ].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <button
          className="button"
          disabled={selection.length !== 2 || busy || s.solved}
          onClick={() => {
            act({
              type: "connect",
              pair: selection as [string, string],
              contradiction: false,
            });
            setSelection([]);
          }}
        >
          <Link2 size={16} />
          Connect
        </button>
        <button
          className="button primary"
          disabled={selection.length !== 2 || busy || s.solved}
          onClick={() => {
            act({
              type: "connect",
              pair: selection as [string, string],
              contradiction: true,
            });
            setSelection([]);
          }}
        >
          <GitCompareArrows size={16} />
          Identify contradiction
        </button>
      </div>
      <div className="board">
        <div className="board-grid">
          {visible.map((card, i) => (
            <button
              key={card.id}
              className={`board-card ${selection.includes(card.id) ? "selected" : ""}`}
              onClick={() =>
                setSelection((old) =>
                  old.includes(card.id)
                    ? old.filter((x) => x !== card.id)
                    : [...old.slice(-1), card.id],
                )
              }
            >
              <span className="board-tack" />
              <span className="eyebrow">
                {card.type} · {card.id}
              </span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              {s.pins.includes(card.id) && <Pin size={15} />}
            </button>
          ))}
        </div>
        {!visible.length && (
          <div className="empty">
            <Network />
            <h3>No matching cards</h3>
            <p>Collect evidence and interview suspects to build your board.</p>
          </div>
        )}
      </div>
      {s.connections.length > 0 && (
        <div className="panel connections">
          <h3>Your connections</h3>
          {s.connections.map(([a, b]) => (
            <div key={[a, b].sort().join("-")}>
              <span>{cards.find((c) => c.id === a)?.title ?? a}</span>
              <span className="red-thread" />
              <Link2 size={16} />
              <span className="red-thread" />
              <span>{cards.find((c) => c.id === b)?.title ?? b}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
export function DeductionsPanel({ data, act, busy }: PanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Turn facts into understanding.</h2>
          <p>Analyze the required exhibits before proposing a conclusion.</p>
        </div>
      </div>
      <div className="deductions-grid">
        {data.case.deductions.map((d, i) => {
          const open = hasRequirements(data.state, d.requires),
            done = data.state.deductions.includes(d.id);
          return (
            <section className="panel deduction" key={d.id}>
              <span className="eyebrow">
                DEDUCTION {String(i + 1).padStart(2, "0")}{" "}
                {done ? "· ESTABLISHED" : !open ? "· EVIDENCE REQUIRED" : ""}
              </span>
              <h3>{d.question}</h3>
              <p className="muted">
                Sources:{" "}
                {d.requires
                  .map(
                    (id) => data.case.evidence.find((e) => e.id === id)?.name,
                  )
                  .join(" + ")}
              </p>
              {done ? (
                <div className="success-line">
                  <Check size={18} /> Conclusion established and saved.
                </div>
              ) : (
                <>
                  <fieldset disabled={!open || busy || data.state.solved}>
                    <legend className="sr-only">{d.question}</legend>
                    {d.options.map((o) => (
                      <label className="radio-option" key={o}>
                        <input
                          type="radio"
                          name={d.id}
                          checked={answers[d.id] === o}
                          onChange={() => setAnswers({ ...answers, [d.id]: o })}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </fieldset>
                  <button
                    className="button"
                    disabled={
                      !open || !answers[d.id] || busy || data.state.solved
                    }
                    onClick={() =>
                      act({ type: "deduce", id: d.id, answer: answers[d.id] })
                    }
                  >
                    {open ? (
                      "Establish deduction"
                    ) : (
                      <>
                        <LockKeyhole size={14} /> More evidence needed
                      </>
                    )}
                  </button>
                </>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
export function TimelinePanel({ data, act, busy }: PanelProps) {
  const available = data.case.timeline.filter((t) =>
    hasRequirements(data.state, t.requires),
  );
  const [order, setOrder] = useState<string[]>(
    data.state.timeline.length
      ? data.state.timeline
      : [...data.case.timeline.map((t) => t.id)].reverse(),
  );
  const move = (index: number, delta: number) => {
    const next = [...order];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setOrder(next);
  };
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Reconstruct the night.</h2>
          <p>
            Order the events from earliest to latest. Check what each timestamp
            actually records.
          </p>
        </div>
        {data.state.timelineCorrect && (
          <span className="tag">
            <Check size={14} /> CORROBORATED
          </span>
        )}
      </div>
      <div className="panel timeline-panel">
        {order.map((id, i) => {
          const event = available.find((t) => t.id === id);
          return (
            <div className="timeline-row" key={id}>
              <span className="timeline-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{event?.title ?? "Unestablished event"}</h3>
                <p>
                  {event?.description ??
                    "Find and analyze more source records to establish this event."}
                </p>
              </div>
              <div>
                <button
                  className="icon-button"
                  disabled={i === 0 || data.state.solved}
                  aria-label={`Move event ${i + 1} earlier`}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={17} />
                </button>
                <button
                  className="icon-button"
                  disabled={i === order.length - 1 || data.state.solved}
                  aria-label={`Move event ${i + 1} later`}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={17} />
                </button>
              </div>
            </div>
          );
        })}
        <button
          className="button primary"
          disabled={
            available.length !== order.length || busy || data.state.solved
          }
          onClick={() => act({ type: "timeline", order })}
        >
          Corroborate chronology
        </button>
        {available.length !== order.length && (
          <p className="muted">Some event sources still need examination.</p>
        )}
      </div>
    </>
  );
}
export function NotebookPanel({ data, act, busy }: PanelProps) {
  const [text, setText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  return (
    <div className="notebook-grid">
      <section className="panel">
        <p className="eyebrow">PERSONAL OBSERVATIONS</p>
        <h2>Your detective notebook</h2>
        <label htmlFor="note">
          {editId
            ? "Edit your note"
            : "A detail, a question, a working theory…"}
        </label>
        <textarea
          id="note"
          rows={7}
          maxLength={5000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What doesn’t fit?"
        />
        <button
          className="button primary"
          disabled={!text.trim() || busy}
          onClick={async () => {
            await act({
              type: "note",
              id: editId ?? crypto.randomUUID(),
              text,
            });
            setText("");
            setEditId(null);
          }}
        >
          <Save size={15} />
          {editId ? "Save changes" : "Save note"}
        </button>
        {data.state.notes.map((n) => (
          <article className="saved-note" key={n.id}>
            <p>{n.text}</p>
            <div>
              <button
                className="text-button"
                onClick={() => {
                  setEditId(n.id);
                  setText(n.text);
                }}
              >
                Edit
              </button>
              <button
                className="icon-button"
                disabled={busy}
                aria-label="Delete note"
                onClick={() => act({ type: "note", id: n.id, text: "" })}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
        {!data.state.notes.length && (
          <p className="muted">
            Your notebook is empty. Record anything you want to revisit.
          </p>
        )}
      </section>
      <aside>
        <section className="panel">
          <p className="eyebrow">PINNED TO YOUR FILE</p>
          <h3>Important leads</h3>
          {!data.state.pins.length && (
            <p className="muted">
              Pin an evidence item or mark a suspect from their detail view.
            </p>
          )}
          {data.state.pins.map((id) => (
            <div className="pinned-line" key={id}>
              <Pin size={15} />
              {data.case.evidence.find((e) => e.id === id)?.name ??
                data.case.suspects.find((s) => s.id === id)?.name}
            </div>
          ))}
        </section>
        <section className="panel">
          <p className="eyebrow">ASSISTANCE LOG</p>
          <h3>Hints requested</h3>
          {data.state.hints.length ? (
            data.state.hints.map((h, i) => (
              <p key={h}>
                <strong>{i + 1}.</strong> {h}
              </p>
            ))
          ) : (
            <p className="muted">
              No hints used. Each requested hint costs 25 points.
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
