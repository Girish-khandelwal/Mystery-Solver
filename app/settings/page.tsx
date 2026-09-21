"use client";
import { useState } from "react";
import { useDetective } from "@/components/Provider";
import { Modal } from "@/components/ui/Modal";
export default function Settings() {
  const { settings, setSettings, current, refresh } = useDetective();
  const [message, setMessage] = useState("");
  const [reset, setReset] = useState<"case" | "all" | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async (next: typeof settings) => {
    setBusy(true);
    try {
      const r = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!r.ok) throw new Error();
      setSettings(next);
      setMessage("Settings saved.");
    } catch {
      setMessage("Settings could not be saved. Please retry.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page settings-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MAKE ROOM FOR FOCUS.</p>
          <h1>Field preferences</h1>
          <p>Your investigation, at your own pace.</p>
        </div>
      </div>
      <section className="panel">
        <h2>Sound & accessibility</h2>
        <label className="setting-row">
          <span>
            Mute sound effects<small>Gameplay never depends on audio.</small>
          </span>
          <input
            type="checkbox"
            checked={settings.muted}
            disabled={busy}
            onChange={(e) => save({ ...settings, muted: e.target.checked })}
          />
        </label>
        <label className="setting-row">
          <span>
            Sound volume<small>{settings.soundVolume}%</small>
          </span>
          <input
            aria-label="Sound volume"
            type="range"
            min={0}
            max={100}
            value={settings.soundVolume}
            onChange={(e) =>
              setSettings({ ...settings, soundVolume: Number(e.target.value) })
            }
            onPointerUp={() => save(settings)}
            onKeyUp={() => save(settings)}
          />
        </label>
        <label className="setting-row">
          <span>
            Music volume
            <small>
              Reserved for a future ambient soundtrack; no music is bundled.
            </small>
          </span>
          <input
            aria-label="Music volume"
            type="range"
            min={0}
            max={100}
            value={settings.musicVolume}
            onChange={(e) =>
              setSettings({ ...settings, musicVolume: Number(e.target.value) })
            }
            onPointerUp={() => save(settings)}
            onKeyUp={() => save(settings)}
          />
        </label>
        <label className="setting-row">
          <span>Reading size</span>
          <select
            value={settings.textSize}
            disabled={busy}
            onChange={(e) => save({ ...settings, textSize: e.target.value })}
          >
            <option value="normal">Standard</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label className="setting-row">
          <span>
            Reduce animations
            <small>
              Also respects your device’s reduced-motion preference.
            </small>
          </span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            disabled={busy}
            onChange={(e) =>
              save({ ...settings, reducedMotion: e.target.checked })
            }
          />
        </label>
        <button
          className="button"
          disabled={busy}
          onClick={() => save({ ...settings, tutorialDone: false })}
        >
          Reset field-guide preference
        </button>
        <p role="status">{message}</p>
      </section>
      <section className="panel danger-zone">
        <p className="eyebrow">RECORD MANAGEMENT</p>
        <h2>Reset investigations</h2>
        <p>
          Resetting permanently removes the selected saves, notes, and results.
          XP is recalculated; achievement awards are cleared and can be earned
          again.
        </p>
        <div className="button-row">
          <button
            className="button"
            disabled={!current}
            onClick={() => setReset("case")}
          >
            Reset current case {current ? `#${current}` : ""}
          </button>
          <button className="button danger" onClick={() => setReset("all")}>
            Reset all progress
          </button>
        </div>
      </section>
      {reset && (
        <Modal
          title={
            reset === "all"
              ? "Erase all investigation progress?"
              : `Reset case #${current}?`
          }
          onClose={() => setReset(null)}
        >
          <p>
            This action permanently deletes{" "}
            {reset === "all"
              ? "every case save"
              : "this case’s evidence, notes, and results"}
            . Your detective name and preferences remain.
          </p>
          <div className="button-row">
            <button
              disabled={busy}
              className="button danger"
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await fetch("/api/settings", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      confirmation: "RESET",
                      ...(reset === "case" ? { caseId: current } : {}),
                    }),
                  });
                  if (!r.ok) throw new Error();
                  for (const key of Object.keys(localStorage))
                    if (key.startsWith("casefile-"))
                      localStorage.removeItem(key);
                  await refresh();
                  setMessage("Selected investigation progress has been reset.");
                  setReset(null);
                } catch {
                  setMessage(
                    "Reset failed. Your records have not been confirmed deleted.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Confirm permanent reset
            </button>
            <button className="button" onClick={() => setReset(null)}>
              Keep my progress
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
