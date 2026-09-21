"use client";
import { Award, LockKeyhole } from "lucide-react";
import { useDetective } from "@/components/Provider";
import { ACHIEVEMENTS } from "@/lib/constants";
export default function Achievements() {
  const { profile } = useDetective();
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">EXCELLENCE LEAVES A RECORD.</p>
          <h1>Marks of distinction</h1>
          <p>
            {profile?.achievements.length ?? 0} of {ACHIEVEMENTS.length}{" "}
            achievements earned.
          </p>
        </div>
      </div>
      <div className="achievement-grid">
        {ACHIEVEMENTS.map((a) => {
          const earned = profile?.achievements.includes(a.id);
          return (
            <section
              className={`panel achievement ${earned ? "earned" : ""}`}
              key={a.id}
            >
              <div className="achievement-icon">
                {earned ? <Award size={32} /> : <LockKeyhole size={27} />}
              </div>
              <span className="eyebrow">
                {earned ? "DISTINCTION EARNED" : "NOT YET EARNED"}
              </span>
              <h2>{a.name}</h2>
              <p>{a.description}</p>
            </section>
          );
        })}
      </div>
      <p className="muted">
        Long-term achievements will become attainable as the remaining case
        outlines are expanded into playable investigations.
      </p>
    </div>
  );
}
