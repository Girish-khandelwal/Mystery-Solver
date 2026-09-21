"use client";
import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useDetective } from "@/components/Provider";
import { catalog } from "@/data/catalog";
export default function Profile() {
  const { profile, refresh } = useDetective();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  if (!profile)
    return <div className="page empty">Opening detective profile…</div>;
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR RECORD SPEAKS FOR ITSELF.</p>
          <h1>Detective profile</h1>
          <p>Every detail found. Every truth established.</p>
        </div>
      </div>
      <section className="panel profile-hero">
        <div className="profile-emblem">
          <ShieldCheck size={50} />
        </div>
        <div>
          <p className="eyebrow">
            LEVEL {Math.floor(profile.xp / 500) + 1} ·{" "}
            {profile.rank.toUpperCase()}
          </p>
          <h2>{profile.username}</h2>
          <p>
            {profile.xp.toLocaleString()} XP{" "}
            {profile.nextRank &&
              `· ${profile.nextRank.xp - profile.xp} XP to ${profile.nextRank.name}`}
          </p>
          <progress
            aria-label="Progress toward next rank"
            max={profile.nextRank?.xp ?? (profile.xp || 1)}
            value={profile.xp}
          />
        </div>
      </section>
      <div className="profile-stats">
        {[
          ["Cases solved", profile.solved],
          ["Cases attempted", profile.attempted],
          ["Accuracy", `${profile.accuracy}%`],
          ["Evidence found", profile.evidence],
          ["Perfect cases", profile.perfect],
          ["Hints used", profile.hints],
          ["Investigation time", `${Math.floor(profile.time / 60)} min`],
          ["Favorite category", profile.favorite],
        ].map(([label, value]) => (
          <div className="panel" key={label}>
            <span className="eyebrow">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="notebook-grid">
        <section className="panel">
          <h2>Investigation history</h2>
          {profile.progress.length ? (
            profile.progress.map((p) => (
              <Link
                className="history-row"
                href={`/case/${p.caseId}`}
                key={p.caseId}
              >
                <span className="eyebrow">#{p.caseId}</span>
                <span>
                  {catalog.find((c) => c.id === p.caseId)?.title}
                  <small>
                    {new Date(p.updatedAt).toLocaleDateString()} ·{" "}
                    {p.status === "solved"
                      ? `Solved · ${p.score} points`
                      : "In progress"}
                  </small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ))
          ) : (
            <p className="muted">
              Your record begins with your first investigation.
            </p>
          )}
        </section>
        <section className="panel">
          <h3>Your local identity</h3>
          <p>
            This browser has its own detective profile. A name is a display
            label, not a password or an account recovery method.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const r = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: name }),
              });
              const d = await r.json();
              setMessage(r.ok ? "Detective name updated." : d.error);
              if (r.ok) refresh();
            }}
          >
            <label htmlFor="username">Detective name</label>
            <input
              id="username"
              minLength={2}
              maxLength={32}
              required
              placeholder={profile.username}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="button" type="submit">
              Update name
            </button>
          </form>
          <p role="status">{message}</p>
        </section>
      </div>
    </div>
  );
}
