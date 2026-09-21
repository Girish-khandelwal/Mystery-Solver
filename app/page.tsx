"use client";
import Link from "next/link";
import {
  ArrowRight,
  FolderOpen,
  Target,
  Fingerprint,
  ChevronRight,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { useDetective } from "@/components/Provider";
import { catalog } from "@/data/catalog";
import { CaseCard } from "@/components/CaseCard";
export default function Home() {
  const { profile, current } = useDetective();
  const active = profile?.progress.find((p) => p.status === "active");
  const featured =
    catalog.find((c) => c.id === (active?.caseId ?? current)) ?? catalog[0];
  return (
    <div className="page home">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR DESK. YOUR NEXT OBSESSION.</p>
          <h1>Welcome back, Detective.</h1>
          <p>The city has its secrets. Let’s find the truth.</p>
        </div>
        <div className="date-stamp">
          CASEFILE BUREAU
          <br />
          <span>EST. 1998 · OPEN INVESTIGATIONS</span>
        </div>
      </div>
      <div className="home-level-choice">
        <span>
          <strong>50 new Easy cases.</strong> Pick any playable level and
          investigate at your own pace.
        </span>
        <div>
          <Link className="button" href="/archive">
            Choose a level
          </Link>
          <Link className="button primary" href="/archive?difficulty=Easy">
            Browse Easy cases <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <section className="hero">
        <img
          src={featured.coverImage}
          alt={`${featured.title} case illustration`}
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="hero-topline">
            <span className="tag">
              {active ? "CONTINUE INVESTIGATION" : "YOUR FIRST CASE"}
            </span>
            <span>CASE #{featured.id}</span>
          </div>
          <h2>{featured.title}</h2>
          <p>{featured.introduction}</p>
          <div className="hero-meta">
            <span>
              <FolderOpen size={15} />
              {featured.category}
            </span>
            <span>
              <Target size={15} />
              {featured.difficulty}
            </span>
            <span>
              <Clock3 size={15} />
              {featured.duration}
            </span>
          </div>
          <Link className="button primary" href={`/case/${featured.id}`}>
            {active ? "Resume investigation" : "Open case file"}
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="hero-file-stamp">
          EVIDENCE DOESN’T LIE.
          <br />
          <strong>PEOPLE DO.</strong>
        </div>
      </section>
      <section className="stats-strip" aria-label="Detective statistics">
        {[
          {
            icon: ShieldCheck,
            label: "DETECTIVE RANK",
            value: profile?.rank ?? "Rookie Investigator",
            detail: "Every case brings you closer.",
          },
          {
            icon: FolderOpen,
            label: "CASES SOLVED",
            value: String(profile?.solved ?? 0).padStart(2, "0"),
            detail: `of ${catalog.length} case files`,
          },
          {
            icon: Target,
            label: "THEORY ACCURACY",
            value: profile?.solved ? `${profile.accuracy}%` : "—",
            detail: "Completed investigations",
          },
          {
            icon: Fingerprint,
            label: "EVIDENCE DISCOVERED",
            value: String(profile?.evidence ?? 0).padStart(2, "0"),
            detail: "The details make the difference.",
          },
        ].map(({ icon: Icon, label, value, detail }) => (
          <div className="stat" key={label}>
            <Icon size={20} />
            <div>
              <span className="stat-label">{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </div>
          </div>
        ))}
      </section>
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">FOLLOW A NEW LEAD</p>
            <h2>On your radar</h2>
          </div>
          <Link href="/archive">
            View case archive <ArrowRight size={16} />
          </Link>
        </div>
        <div className="case-grid home-grid">
          {catalog.slice(1, 5).map((item) => (
            <CaseCard item={item} key={item.id} />
          ))}
        </div>
      </section>
      <section className="desk-bottom">
        <div>
          <span className="outlined-icon">
            <Fingerprint size={24} />
          </span>
          <div>
            <span className="eyebrow">A GOOD DETECTIVE NEVER ASSUMES.</span>
            <p>Question the obvious. Connect the overlooked.</p>
          </div>
        </div>
        <Link href="/archive">
          Find your next case <ChevronRight size={17} />
        </Link>
      </section>
    </div>
  );
}
