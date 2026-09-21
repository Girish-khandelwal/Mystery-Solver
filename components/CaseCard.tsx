"use client";
import Link from "next/link";
import { ArrowUpRight, Clock3, LockKeyhole, Check } from "lucide-react";
import type { CaseMeta } from "@/types/game";
import { useDetective } from "./Provider";
export function CaseCard({ item }: { item: CaseMeta }) {
  const { profile } = useDetective();
  const progress = profile?.progress.find((p) => p.caseId === item.id);
  const locked = item.caseNumber > 5 + (profile?.solved ?? 0) * 2;
  const outline = item.contentStatus === "outline";
  return (
    <Link
      href={outline || locked ? `/archive?case=${item.id}` : `/case/${item.id}`}
      className={`case-card ${outline ? "outline-card" : ""}`}
    >
      <div className="case-card-image">
        <img
          src={item.coverImage}
          alt={`${item.title} case illustration`}
          loading="lazy"
        />
        <span className="case-number">CASE {item.id}</span>
        <span className="card-difficulty">{item.difficulty}</span>
        {(outline || locked) && (
          <div className="card-lock">
            <LockKeyhole size={23} />
          </div>
        )}
      </div>
      <div className="case-card-body">
        <div className="category">{item.category}</div>
        <h3>{item.title}</h3>
        <p>{item.introduction}</p>
        <div className="card-footer">
          <span>
            {outline ? (
              "IN DEVELOPMENT"
            ) : progress?.status === "solved" ? (
              <>
                <Check size={13} /> SOLVED · {progress.score}
              </>
            ) : locked ? (
              "SOLVE CASES TO UNLOCK"
            ) : progress ? (
              "IN PROGRESS"
            ) : (
              "OPEN CASE"
            )}{" "}
          </span>
          {outline || locked ? (
            <LockKeyhole size={14} />
          ) : (
            <ArrowUpRight size={17} />
          )}
        </div>
      </div>
    </Link>
  );
}
