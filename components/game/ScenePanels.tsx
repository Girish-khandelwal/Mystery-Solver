"use client";
import { useState } from "react";
import {
  MapPin,
  LockKeyhole,
  Search,
  FlaskConical,
  Check,
  Pin,
  MessageSquare,
  Fingerprint,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { hasRequirements, locationOpen } from "@/lib/engine";
import type { PanelProps } from "./Investigation";
export function ScenePanel({ data, act, busy }: PanelProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [exhibit, setExhibit] = useState<string | null>(null);
  const c = data.case,
    s = data.state;
  const scene = c.locations.find((l) => l.id === selected);
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Follow the scene.</h2>
          <p>Inspect a location. Every detail has a context.</p>
        </div>
        <span className="eyebrow">{s.visited.length} LOCATIONS VISITED</span>
      </div>
      <div className="location-grid">
        {c.locations.map((l) => {
          const open = locationOpen(c, s, l.id);
          return (
            <button
              className={`location-card ${!open ? "locked" : ""}`}
              key={l.id}
              disabled={!open || busy}
              onClick={async () => {
                await act({ type: "visit", id: l.id });
                setSelected(l.id);
              }}
            >
              <img src={l.image} alt={`${l.name} illustration`} />
              <div className="location-body">
                <span className="eyebrow">
                  {!open ? (
                    <>
                      <LockKeyhole size={13} /> NEW LEAD REQUIRED
                    </>
                  ) : s.visited.includes(l.id) ? (
                    "VISITED"
                  ) : (
                    "AVAILABLE"
                  )}
                </span>
                <h3>{l.name}</h3>
                <p>
                  {open
                    ? l.description
                    : l.deductionRequired
                      ? "Establish the timing deduction to request laboratory access."
                      : `Analyze ${l.requires?.map((id) => c.evidence.find((e) => e.id === id)?.name).join(", ")} to follow this lead.`}
                </p>
              </div>
              <MapPin className="location-pin" size={18} />
            </button>
          );
        })}
      </div>
      {scene && (
        <Modal title={scene.name} onClose={() => setSelected(null)}>
          <p>{scene.description}</p>
          <div className="interactive-scene">
            <img
              src={scene.image}
              alt={`Searchable illustrated scene: ${scene.name}`}
            />
            {scene.hotspots.map((h, i) => (
              <button
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                className={`hotspot ${s.discovered.includes(h.evidenceId) ? "found" : ""}`}
                aria-label={h.label}
                key={h.evidenceId}
                disabled={busy}
                onClick={async () => {
                  if (!s.discovered.includes(h.evidenceId))
                    await act({ type: "discover", id: h.evidenceId });
                  setExhibit(h.evidenceId);
                }}
              >
                {s.discovered.includes(h.evidenceId) ? (
                  <Check size={15} />
                ) : (
                  i + 1
                )}
              </button>
            ))}
          </div>
          <div className="hotspot-list">
            {scene.hotspots.map((h, i) => (
              <button
                disabled={busy}
                onClick={async () => {
                  if (!s.discovered.includes(h.evidenceId))
                    await act({ type: "discover", id: h.evidenceId });
                  setExhibit(h.evidenceId);
                }}
                key={h.evidenceId}
              >
                <span>{i + 1}</span>
                {h.label}
                {s.discovered.includes(h.evidenceId) && <Check size={14} />}
              </button>
            ))}
          </div>
        </Modal>
      )}
      {exhibit && s.discovered.includes(exhibit) && (
        <EvidenceViewer
          {...{ data, act, busy }}
          id={exhibit}
          close={() => setExhibit(null)}
        />
      )}
    </>
  );
}
export function EvidenceViewer({
  data,
  act,
  busy,
  id,
  close,
}: PanelProps & { id: string; close: () => void }) {
  const e = data.case.evidence.find((e) => e.id === id)!;
  const analyzed = data.state.analyzed.includes(id);
  return (
    <Modal title={e.name} onClose={close}>
      <div className="evidence-detail">
        <img
          src={e.image}
          alt={`Illustrated evidence document for ${e.name}`}
        />
        <div>
          <p className="eyebrow">
            EXHIBIT {id.toUpperCase()} · {e.type.toUpperCase()}
          </p>
          <p className="muted">
            Recovered at{" "}
            {data.case.locations.find((l) => l.id === e.locationId)?.name}
          </p>
          <p>{e.description}</p>
        </div>
      </div>
      <div className="analysis">
        <span className="eyebrow">
          <FlaskConical size={16} />{" "}
          {analyzed ? "EXAMINER’S ANALYSIS" : "ANALYSIS PENDING"}
        </span>
        <p>
          {analyzed
            ? e.analysis
            : "Initial observations can mislead. Request an examination before drawing conclusions."}
        </p>
        {!analyzed && (
          <button
            disabled={busy}
            className="button primary"
            onClick={() => act({ type: "analyze", id })}
          >
            {busy ? "Analyzing evidence…" : "Request analysis"}
          </button>
        )}
      </div>
      <div className="button-row">
        <button
          disabled={busy}
          className="button"
          onClick={() => act({ type: "pin", id })}
        >
          <Pin size={15} />
          {data.state.pins.includes(id) ? "Unpin evidence" : "Mark important"}
        </button>
        <span className="muted">
          Related:{" "}
          {e.relatedSuspects
            .map((id) => data.case.suspects.find((s) => s.id === id)?.name)
            .join(", ") || "Not yet attributed"}
        </span>
      </div>
    </Modal>
  );
}
export function EvidencePanel({ data, act, busy }: PanelProps) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const evidence = data.case.evidence.filter(
    (e) =>
      data.state.discovered.includes(e.id) &&
      (filter === "All" ||
        e.type === filter ||
        (filter === "Important" && data.state.pins.includes(e.id))),
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Evidence locker</h2>
          <p>
            Observations are a beginning. Analysis is where the story changes.
          </p>
        </div>
      </div>
      <div className="filter-tabs">
        {[
          "All",
          "Physical",
          "Digital",
          "Documents",
          "Forensic",
          "Witness",
          "Important",
        ].map((f) => (
          <button
            key={f}
            className={filter === f ? "selected" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="evidence-grid">
        {evidence.map((e) => (
          <button
            className="evidence-card"
            onClick={() => setSelected(e.id)}
            key={e.id}
          >
            <div className="evidence-thumb">
              <img src={e.image} alt="Evidence file illustration" />
              <span>{e.type}</span>
              {data.state.pins.includes(e.id) && <Pin size={17} />}
            </div>
            <div>
              <span className="eyebrow">EXHIBIT {e.id.toUpperCase()}</span>
              <h3>{e.name}</h3>
              <p>{e.description}</p>
              <span
                className={
                  data.state.analyzed.includes(e.id) ? "analyzed" : "pending"
                }
              >
                {data.state.analyzed.includes(e.id)
                  ? "ANALYSIS COMPLETE"
                  : "AWAITING ANALYSIS"}
              </span>
            </div>
          </button>
        ))}
      </div>
      {!evidence.length && (
        <div className="empty">
          <Fingerprint size={32} />
          <h3>No exhibits in this view</h3>
          <p>
            Visit a location and inspect its marked details to secure evidence.
          </p>
        </div>
      )}
      {selected && (
        <EvidenceViewer
          {...{ data, act, busy }}
          id={selected}
          close={() => setSelected(null)}
        />
      )}
    </>
  );
}
export function SuspectsPanel({ data, act, busy }: PanelProps) {
  const [selected, setSelected] = useState(data.case.suspects[0].id);
  const p = data.case.suspects.find((p) => p.id === selected)!;
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Everyone has a story.</h2>
          <p>Listen carefully. A lie is a lead, not a conviction.</p>
        </div>
      </div>
      <div className="interview-grid">
        <aside className="suspect-list">
          {data.case.suspects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={selected === p.id ? "selected" : ""}
            >
              <img
                src={p.avatar}
                alt={`Placeholder portrait for ${p.name}`}
                style={{ filter: `hue-rotate(${i * 35}deg)` }}
              />
              <span>
                {p.name}
                <small>{p.occupation}</small>
              </span>
            </button>
          ))}
        </aside>
        <section className="panel">
          <div className="suspect-heading">
            <img src={p.avatar} alt={`Placeholder portrait for ${p.name}`} />
            <div>
              <span className="eyebrow">PERSON OF INTEREST · AGE {p.age}</span>
              <h2>{p.name}</h2>
              <p>
                {p.occupation} · {p.relationship}
              </p>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => act({ type: "pin", id: p.id })}
              >
                <Pin size={14} />
                {data.state.pins.includes(p.id)
                  ? "Marked suspicious · unmark"
                  : "Mark suspicious"}
              </button>
            </div>
          </div>
          <p>{p.background}</p>
          <p className="muted">{p.personality}</p>
          <div className="callout">
            <span className="eyebrow">POTENTIAL MOTIVE</span>
            <p>{p.motive}</p>
          </div>
          <h3>Interview transcript</h3>
          <div className="dialogue">
            {p.questions.map((q) => {
              const unlocked = hasRequirements(data.state, q.requires);
              const asked = data.state.interviews.includes(q.id);
              return (
                <div key={q.id} className="dialogue-item">
                  <button
                    disabled={!unlocked || busy || asked || data.state.solved}
                    className="question"
                    onClick={() => act({ type: "interview", id: q.id })}
                  >
                    {unlocked ? (
                      <MessageSquare size={16} />
                    ) : (
                      <LockKeyhole size={16} />
                    )}
                    <span>
                      {q.prompt}
                      {!unlocked && (
                        <small>
                          Analyze{" "}
                          {q.requires
                            ?.map(
                              (id) =>
                                data.case.evidence.find((e) => e.id === id)
                                  ?.name,
                            )
                            .join(", ")}
                        </small>
                      )}
                    </span>
                    {asked && <Check size={15} />}
                  </button>
                  {asked && (
                    <blockquote>
                      {q.answer}
                      <small>
                        Statement {q.id.toUpperCase()} · Added to evidence board
                      </small>
                    </blockquote>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <section className="panel witness-panel">
        <span className="eyebrow">INDEPENDENT ACCOUNTS</span>
        <h2>Witness statements</h2>
        {data.case.witnesses
          .filter((w) => hasRequirements(data.state, w.requires))
          .map((w) => (
            <blockquote key={w.id}>
              <strong>{w.name}</strong>
              <p>“{w.statement}”</p>
              <small>{w.reliability}</small>
            </blockquote>
          ))}
      </section>
    </>
  );
}
