"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderOpen } from "lucide-react";
import { catalog } from "@/data/catalog";
import { CaseCard } from "@/components/CaseCard";
import { useDetective } from "@/components/Provider";
export default function Archive() {
  const router = useRouter();
  const playable = catalog.filter((c) => c.contentStatus === "playable");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All difficulties");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All cases");
  const { profile } = useDetective();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("difficulty") === "Easy") {
      setDifficulty("Easy");
      setStatus("Playable");
    }
  }, []);
  const filtered = catalog.filter((c) => {
    const p = profile?.progress.find((p) => p.caseId === c.id);
    return (
      `${c.title} ${c.id} ${c.category}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (difficulty === "All difficulties" || c.difficulty === difficulty) &&
      (category === "All categories" || c.category === category) &&
      (status === "All cases" ||
        (status === "Playable" && c.contentStatus === "playable") ||
        (status === "Solved" && p?.status === "solved") ||
        (status === "In progress" && p?.status === "active") ||
        (status === "Unsolved" && p?.status !== "solved"))
    );
  });
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{catalog.length} FILES. COUNTLESS SECRETS.</p>
          <h1>The case archive</h1>
          <p>
            Choose any of the 150 levels, in any order. No rank or previous
            completion required.
          </p>
        </div>
        <span className="tag">{playable.length} LEVELS · ALL UNLOCKED</span>
      </div>
      <section className="level-selector" aria-label="Level selection">
        <div>
          <p className="eyebrow">START ANYWHERE</p>
          <h2>Choose your next level</h2>
          <p>
            All 150 cases are open. Try the 50 Easy cases for a shorter
            investigation.
          </p>
        </div>
        <label htmlFor="level-picker">
          Jump directly to a level
          <select
            id="level-picker"
            defaultValue=""
            onChange={(e) => router.push(`/case/${e.target.value}`)}
          >
            <option value="" disabled>
              Select a level…
            </option>
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.id} · {c.title} ·{" "}
                {c.contentStatus === "playable"
                  ? c.difficulty
                  : "In development"}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button primary"
          onClick={() => {
            setDifficulty("Easy");
            setStatus("Playable");
            setCategory("All categories");
            setQuery("");
          }}
        >
          Browse 50 Easy cases
        </button>
      </section>
      <div className="archive-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search case files"
            placeholder="Search by name, number or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          {[
            "All difficulties",
            "Easy",
            "Hard",
            "Very Hard",
            "Expert",
            "Master Detective",
            "Legendary",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["All categories", ...new Set(catalog.map((c) => c.category))].map(
            (x) => (
              <option key={x}>{x}</option>
            ),
          )}
        </select>
      </div>
      <div className="filter-tabs">
        {["All cases", "Playable", "In progress", "Solved", "Unsolved"].map(
          (x) => (
            <button
              key={x}
              className={status === x ? "selected" : ""}
              onClick={() => setStatus(x)}
            >
              {x}
            </button>
          ),
        )}
        <span>{filtered.length} CASE FILES</span>
      </div>
      <div className="case-grid">
        {filtered.map((item) => (
          <CaseCard key={item.id} item={item} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <FolderOpen />
          <h3>No matching files</h3>
          <p>Try a broader search or a different filter.</p>
        </div>
      )}
    </div>
  );
}
