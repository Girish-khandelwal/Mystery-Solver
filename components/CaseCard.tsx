"use client";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { CaseMeta } from "@/types/game";
import { useDetective } from "./Provider";
export function CaseCard({ item }: { item: CaseMeta }) {
  const { profile } = useDetective();
  const progress = profile?.progress.find((p) => p.caseId === item.id);
  return (
    <Link href={`/case/${item.id}`} className="case-card">
      <div className="case-card-image">
        <img
          src={item.coverImage}
          alt={`${item.title} case illustration`}
          loading="lazy"
        />
        <span className="case-number">CASE {item.id}</span>
        <span className="card-difficulty">{item.difficulty}</span>
      </div>
      <div className="case-card-body">
        <div className="category">{item.category}</div>
        <h3>{item.title}</h3>
        <p>{item.introduction}</p>
        <div className="card-footer">
          <span>
            {progress?.status === "solved" ? (
              <>
                <Check size={13} /> SOLVED · {progress.score}
              </>
            ) : progress ? (
              "IN PROGRESS"
            ) : (
              "OPEN CASE"
            )}{" "}
          </span>
          <ArrowUpRight size={17} />
        </div>
      </div>
    </Link>
  );
}
