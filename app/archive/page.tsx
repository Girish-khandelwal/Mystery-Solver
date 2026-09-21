"use client";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, FolderOpen } from "lucide-react";
import { catalog } from "@/data/catalog";
import { CaseCard } from "@/components/CaseCard";
import { useDetective } from "@/components/Provider";
import { Modal } from "@/components/ui/Modal";
export default function Archive() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All difficulties");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All cases");
  const [selected, setSelected] = useState<string | null>(null);
  const { profile } = useDetective();
  useEffect(() => {
    setSelected(new URLSearchParams(location.search).get("case"));
  }, []);
  const chosen = catalog.find((c) => c.id === selected);
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
        (status === "In development" && c.contentStatus === "outline") ||
        (status === "Solved" && p?.status === "solved") ||
        (status === "In progress" && p?.status === "active") ||
        (status === "Unsolved" && p?.status !== "solved"))
    );
  });
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">100 FILES. COUNTLESS SECRETS.</p>
          <h1>The case archive</h1>
          <p>Choose a mystery. Leave no question unanswered.</p>
        </div>
        <span className="tag">11 PLAYABLE · 89 IN DEVELOPMENT</span>
      </div>
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
        {[
          "All cases",
          "Playable",
          "In progress",
          "Solved",
          "Unsolved",
          "In development",
        ].map((x) => (
          <button
            key={x}
            className={status === x ? "selected" : ""}
            onClick={() => setStatus(x)}
          >
            {x}
          </button>
        ))}
        <span>{filtered.length} CASE FILES</span>
      </div>
      <div className="case-grid">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClickCapture={(e) => {
              if (
                item.contentStatus === "outline" ||
                item.caseNumber > 5 + (profile?.solved ?? 0) * 2
              ) {
                e.preventDefault();
                setSelected(item.id);
              }
            }}
          >
            <CaseCard item={item} />
          </div>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <FolderOpen />
          <h3>No matching files</h3>
          <p>Try a broader search or a different filter.</p>
        </div>
      )}
      {chosen && (
        <Modal title={chosen.title} onClose={() => setSelected(null)}>
          <p className="eyebrow">
            CASE #{chosen.id} · {chosen.difficulty}
          </p>
          <p>{chosen.introduction}</p>
          <div className="callout">
            {chosen.contentStatus === "outline"
              ? "This is a planned investigation. Its story outline is in the archive, but evidence and interviews are still being authored. It cannot be played yet."
              : "Solve an available investigation to open more case files. Each solved case unlocks two more, up to the available authored content."}
          </div>
        </Modal>
      )}
    </div>
  );
}
