"use client";
import { useState } from "react";
import Link from "next/link";
import { Scale, CheckCircle2, ArrowRight } from "lucide-react";
import type { PanelProps } from "./Investigation";
export function TheoryPanel({ data, act, busy }: PanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [proof, setProof] = useState<string[]>([]);
  const ready = data.state.deductions.length >= 2 && data.state.timelineCorrect;
  return (
    <div className="theory-layout">
      <section className="panel">
        <p className="eyebrow">THE BURDEN OF PROOF IS YOURS.</p>
        <h2>Submit your final theory</h2>
        <p>
          Your complete account will be evaluated together. A correct name
          without a coherent explanation and decisive evidence will not close
          the case.
        </p>
        {!ready && (
          <div className="callout">
            Establish at least two deductions and corroborate the timeline
            before submitting.
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act({ type: "theory", answers, proof });
          }}
        >
          {data.case.finalQuestions.map((q, i) => (
            <fieldset className="theory-question" key={q.id}>
              <legend>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {q.question}
              </legend>
              {q.options.map((o) => (
                <label key={o} className="radio-option">
                  <input
                    type="radio"
                    name={`theory-${q.id}`}
                    required
                    checked={answers[q.id] === o}
                    onChange={() => setAnswers({ ...answers, [q.id]: o })}
                  />
                  {o}
                </label>
              ))}
            </fieldset>
          ))}
          <fieldset className="theory-question">
            <legend>Attach the evidence that proves your account</legend>
            <p className="muted">
              Select the decisive exhibits. Only analyzed evidence is
              admissible.
            </p>
            {data.case.evidence
              .filter((e) => data.state.analyzed.includes(e.id))
              .map((e) => (
                <label className="radio-option" key={e.id}>
                  <input
                    type="checkbox"
                    checked={proof.includes(e.id)}
                    onChange={() =>
                      setProof((p) =>
                        p.includes(e.id)
                          ? p.filter((id) => id !== e.id)
                          : [...p, e.id],
                      )
                    }
                  />
                  {e.name}
                </label>
              ))}
          </fieldset>
          <button
            className="button primary"
            disabled={
              !ready ||
              busy ||
              !proof.length ||
              data.case.finalQuestions.some((q) => !answers[q.id])
            }
          >
            <Scale size={17} />
            {busy ? "Evaluating complete theory…" : "Submit final theory"}
          </button>
        </form>
      </section>
      <aside className="panel scoring-guide">
        <p className="eyebrow">INVESTIGATION STANDARD</p>
        <h3>How your work is assessed</h3>
        <dl>
          <dt>Complete explanation</dt>
          <dd>600</dd>
          <dt>Evidence discovered</dt>
          <dd>150</dd>
          <dt>Contradictions</dt>
          <dd>100</dd>
          <dt>Chronology</dt>
          <dd>100</dd>
          <dt>Starting bonus</dt>
          <dd>50</dd>
        </dl>
        <hr />
        <p>
          Hint: −25
          <br />
          Incorrect theory: −75
          <br />
          Unsupported deduction, contradiction or chronology: −15
        </p>
        <p className="muted">
          Your score is calculated on the server. Time is tracked for your
          profile, but never penalizes careful reading.
        </p>
      </aside>
    </div>
  );
}
export function ReportPanel(props: PanelProps) {
  const [retry, setRetry] = useState(false);
  const r = props.data.state.report!;
  if (retry && !r.solved) return <TheoryPanel {...props} />;
  return (
    <section className="report panel">
      <p className="eyebrow">
        CASE #{props.data.case.id} · INVESTIGATION REPORT
      </p>
      <CheckCircle2 size={42} />
      <h2>
        {r.solved
          ? "Case solved. Truth established."
          : "The theory does not hold."}
      </h2>
      <p>
        {r.solved
          ? "The complete reconstruction is now unsealed."
          : "Your investigation is still open. The submitted account or its supporting evidence is incomplete."}
      </p>
      <div className="report-stats">
        <div>
          <strong>
            {r.score}
            <small>/ 1000</small>
          </strong>
          <span>INVESTIGATION SCORE</span>
        </div>
        <div>
          <strong>{r.accuracy}%</strong>
          <span>THEORY ACCURACY</span>
        </div>
        <div>
          <strong>{r.grade}</strong>
          <span>DETECTIVE GRADE</span>
        </div>
      </div>
      <div className="report-metrics">
        <span>
          Evidence {r.evidenceFound} / {r.evidenceTotal}
        </span>
        <span>
          Contradictions {r.contradictionsFound} / {r.contradictionsTotal}
        </span>
        <span>Hints {r.hints}</span>
        <span>Wrong deductions {r.wrongDeductions}</span>
        <span>Wrong theories {r.wrongAccusations}</span>
      </div>
      {r.solved && (
        <p className="rank-change">
          {r.previousRank} <ArrowRight size={16} /> {r.rank}
        </p>
      )}
      <div className="solution">
        {r.explanation.map((section) => (
          <section key={section.title}>
            <p className="eyebrow">{section.title}</p>
            <p>{section.text}</p>
          </section>
        ))}
      </div>
      {r.solved ? (
        <Link className="button primary" href="/archive">
          Choose your next case <ArrowRight size={16} />
        </Link>
      ) : (
        <button className="button primary" onClick={() => setRetry(true)}>
          Revise your theory
        </button>
      )}
    </section>
  );
}
