"use client";
import { gameRequest, isOfflineApp } from "@/lib/client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  MapPin,
  Users,
  Fingerprint,
  Network,
  Clock3,
  Lightbulb,
  NotebookPen,
  Scale,
  FileText,
  Check,
  Save,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { GamePayload } from "@/types/game";
import type { Action } from "@/lib/engine";
import { investigationStage } from "@/lib/engine";
import { useDetective } from "@/components/Provider";
import { Modal } from "@/components/ui/Modal";
import { ScenePanel, EvidencePanel, SuspectsPanel } from "./ScenePanels";
import {
  BoardPanel,
  DeductionsPanel,
  TimelinePanel,
  NotebookPanel,
} from "./ReasoningPanels";
import { TheoryPanel, ReportPanel } from "./TheoryPanel";
const tabs = [
  ["briefing", "Case file", FileText],
  ["locations", "Locations", MapPin],
  ["suspects", "Suspects", Users],
  ["evidence", "Evidence", Fingerprint],
  ["board", "Evidence board", Network],
  ["timeline", "Timeline", Clock3],
  ["deductions", "Deductions", Lightbulb],
  ["notebook", "Notebook", NotebookPen],
  ["theory", "Final theory", Scale],
] as const;
export interface PanelProps {
  data: GamePayload;
  act: (action: Action) => Promise<void>;
  busy: boolean;
}
export default function Investigation({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<GamePayload | null>(null);
  const [tab, setTab] = useState("briefing");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [tutorial, setTutorial] = useState(false);
  const [pending, setPending] = useState<Action | null>(null);
  const { profile, setCurrent, refresh, settings, setSettings, play } =
    useDetective();
  const lock = useRef(false);
  const stateRef = useRef<GamePayload | null>(null);
  const load = useCallback(async () => {
    try {
      const r = await gameRequest(`/api/game/${id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setData(d);
      stateRef.current = d;
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open the case.");
    }
  }, [id]);
  useEffect(() => {
    if (!profile) return;
    load();
    setCurrent(id);
    try {
      const p = localStorage.getItem(`casefile-pending-${id}`);
      if (p) setPending(JSON.parse(p));
    } catch {}
  }, [id, load, !!profile]);
  useEffect(() => {
    setTab(searchParams.get("tab") ?? "briefing");
  }, [searchParams]);
  const act = useCallback(
    async (action: Action) => {
      if (lock.current || !stateRef.current) return;
      lock.current = true;
      setBusy(true);
      try {
        const r = await gameRequest(`/api/game/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version: stateRef.current.version, action }),
        });
        const d = await r.json();
        if (!r.ok) {
          if (r.status === 409) await load();
          throw new Error(d.error);
        }
        setData(d);
        stateRef.current = d;
        setError("");
        if (action.type !== "tick") setFeedback(d.feedback);
        if (["discover", "deduce", "theory"].includes(action.type)) play();
        if (action.type === "theory") refresh();
        try {
          localStorage.removeItem(`casefile-pending-${id}`);
        } catch {}
        setPending(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "The save failed.");
        if (e instanceof TypeError) {
          setPending(action);
          try {
            localStorage.setItem(
              `casefile-pending-${id}`,
              JSON.stringify(action),
            );
          } catch {}
        }
      } finally {
        lock.current = false;
        setBusy(false);
      }
    },
    [id, load, play, refresh],
  );
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && !pending)
        act({ type: "tick", seconds: 30 });
    }, 30000);
    return () => clearInterval(timer);
  }, [act, pending]);
  if (!data)
    return (
      <div className="page">
        <div className="empty">
          <FolderOpenFallback />
          <h2>{error ? "Unable to open case" : "Opening case file…"}</h2>
          <p>{error || "Retrieving your saved investigation."}</p>
          {error && (
            <>
              <button className="button" onClick={load}>
                Try again
              </button>
              <Link className="button" href="/archive">
                Return to archive
              </Link>
            </>
          )}
        </div>
      </div>
    );
  const props = { data, act, busy };
  const c = data.case;
  return (
    <div className="page investigation">
      <Link href="/archive" className="back-link">
        <ArrowLeft size={14} /> BACK TO ARCHIVE
      </Link>
      <div className="case-header">
        <div>
          <p className="eyebrow">
            CASE #{c.id} <span>·</span> {c.category.toUpperCase()}
          </p>
          <h1>{c.title}</h1>
          <div className="case-status">
            <span className="tag">{c.difficulty}</span>
            <span>{investigationStage(data.state)}</span>
            <span>
              <Clock3 size={14} />
              {Math.floor(data.state.elapsed / 60)} min on case
            </span>
          </div>
        </div>
        <div className="case-tools">
          <span className="save-status">
            <Save size={14} />
            {busy
              ? "Saving…"
              : pending
                ? "Unsynced action"
                : error
                  ? "Save needs attention"
                  : isOfflineApp
                    ? "Saved on this device"
                    : "Saved to database"}
          </span>
          <button
            className="icon-button"
            onClick={() => setTutorial(true)}
            aria-label="Open investigation tutorial"
          >
            <HelpCircle size={20} />
          </button>
          <button
            className="button subtle"
            disabled={busy || data.state.solved}
            onClick={() => act({ type: "hint" })}
          >
            <Lightbulb size={16} /> Request hint
          </button>
        </div>
      </div>
      <nav className="investigation-tabs" aria-label="Investigation sections">
        {tabs.map(([id, label, Icon]) => (
          <button
            className={tab === id ? "selected" : ""}
            onClick={() => setTab(id)}
            key={id}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      {pending && (
        <div className="callout">
          {isOfflineApp
            ? "An action could not be saved on this device."
            : "An action could not reach the database."}{" "}
          <button className="button" onClick={() => act(pending)}>
            Retry unsynced action
          </button>
        </div>
      )}
      {feedback && (
        <div className="feedback" role="status">
          <Check size={16} />
          {feedback}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setFeedback("")}
          >
            ×
          </button>
        </div>
      )}
      {tab === "briefing" && (
        <div className="briefing-grid">
          <div>
            <div className="briefing-image">
              <img
                src={c.coverImage}
                alt={`${c.setting}, illustrated case scene`}
              />
              <span className="photo-label">
                EXHIBIT A · {c.setting.toUpperCase()}
              </span>
            </div>
            <div className="panel">
              <p className="eyebrow">INVESTIGATOR’S BRIEFING</p>
              <h2>Something doesn’t add up.</h2>
              <p className="prose">{c.briefing}</p>
              <button
                className="button primary"
                onClick={() => setTab("locations")}
              >
                Enter the scene <ArrowRight size={17} />
              </button>
            </div>
          </div>
          <aside>
            <div className="panel case-facts">
              <span className="eyebrow">FILE PARTICULARS</span>
              <dl>
                <dt>DATE OF INCIDENT</dt>
                <dd>{c.date}</dd>
                <dt>LOCATION</dt>
                <dd>{c.setting}</dd>
                <dt>ESTIMATED INVESTIGATION</dt>
                <dd>{c.duration}</dd>
              </dl>
              <hr />
              <h3>What we know</h3>
              <ul>
                {c.knownFacts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="callout">
              <Lightbulb size={20} />
              <p>
                Observe first. Analyze what you find. A convincing story is only
                a theory until the evidence supports it.
              </p>
              <button onClick={() => setTutorial(true)} className="text-button">
                {settings.tutorialDone
                  ? "Review field guide"
                  : "Start optional field guide"}{" "}
                →
              </button>
            </div>
          </aside>
        </div>
      )}
      {tab === "locations" && <ScenePanel {...props} />}{" "}
      {tab === "evidence" && <EvidencePanel {...props} />}{" "}
      {tab === "suspects" && <SuspectsPanel {...props} />}{" "}
      {tab === "board" && <BoardPanel {...props} />}{" "}
      {tab === "timeline" && <TimelinePanel {...props} />}{" "}
      {tab === "deductions" && <DeductionsPanel {...props} />}{" "}
      {tab === "notebook" && <NotebookPanel {...props} />}{" "}
      {tab === "theory" &&
        (data.state.report ? (
          <ReportPanel {...props} />
        ) : (
          <TheoryPanel {...props} />
        ))}
      {tutorial && (
        <Modal
          title="Your detective’s field guide"
          onClose={() => setTutorial(false)}
        >
          <ol className="tutorial-list">
            <li>
              <strong>Visit a location.</strong> Select a marked point in the
              scene to collect an exhibit.
            </li>
            <li>
              <strong>Analyze evidence.</strong> The initial observation may be
              incomplete. Analysis opens leads and interview questions.
            </li>
            <li>
              <strong>Interview suspects.</strong> Answers become statement
              cards on your evidence board.
            </li>
            <li>
              <strong>Compare two facts.</strong> Connect them freely, or test
              whether they form a provable contradiction.
            </li>
            <li>
              <strong>Establish deductions.</strong> Use original records to
              unlock new investigation paths.
            </li>
            <li>
              <strong>Reconstruct the timeline.</strong> Order every event using
              its source time.
            </li>
            <li>
              <strong>Submit a complete theory.</strong> Answer every question
              and attach decisive analyzed evidence. Scoring happens only when
              the whole theory is submitted.
            </li>
          </ol>
          <div className="button-row">
            <button
              className="button primary"
              onClick={async () => {
                const r = await gameRequest("/api/settings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tutorialDone: true }),
                });
                if (r.ok) {
                  setSettings({ ...settings, tutorialDone: true });
                  setTutorial(false);
                }
              }}
            >
              Ready to investigate
            </button>
            <button className="button" onClick={() => setTutorial(false)}>
              Skip tutorial
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function FolderOpenFallback() {
  return <FileText size={36} />;
}
