"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import type { ProfileData } from "@/types/game";
interface Preferences {
  muted: boolean;
  soundVolume: number;
  musicVolume: number;
  textSize: string;
  reducedMotion: boolean;
  tutorialDone: boolean;
}
const defaults: Preferences = {
  muted: true,
  soundVolume: 50,
  musicVolume: 25,
  textSize: "normal",
  reducedMotion: false,
  tutorialDone: false,
};
const Context = createContext<{
  profile: ProfileData | null;
  error: string;
  refresh: () => Promise<void>;
  settings: Preferences;
  setSettings: (s: Preferences) => void;
  current: string | null;
  setCurrent: (id: string) => void;
  play: () => void;
}>({
  profile: null,
  error: "",
  refresh: async () => {},
  settings: defaults,
  setSettings: () => {},
  current: null,
  setCurrent: () => {},
  play: () => {},
});
export const useDetective = () => useContext(Context);
export function Provider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(defaults);
  const [current, setCurrentState] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProfile(data);
      setError("");
      const active = data.progress.find(
        (p: { status: string }) => p.status === "active",
      );
      if (active) setCurrentState((previous) => previous ?? active.caseId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to connect.");
    }
  }, []);
  useEffect(() => {
    refresh().then(() =>
      fetch("/api/settings")
        .then((r) => r.json())
        .then((s) => {
          if (!s.error) setSettings(s);
        })
        .catch(() => setError("Preferences could not be loaded. Reconnect and reload to try again.")),
    );
    try {
      setCurrentState(localStorage.getItem("casefile-current"));
    } catch {}
  }, [refresh, pathname]);
  useEffect(() => {
    document.documentElement.dataset.text = settings.textSize;
    document.documentElement.dataset.motion = settings.reducedMotion
      ? "reduced"
      : "normal";
  }, [settings]);
  const setCurrent = (id: string) => {
    setCurrentState(id);
    try {
      localStorage.setItem("casefile-current", id);
    } catch {}
  };
  const play = () => {
    if (settings.muted) return;
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        330,
        ctx.currentTime + 0.15,
      );
      gain.gain.setValueAtTime(
        (settings.soundVolume / 100) * 0.12,
        ctx.currentTime,
      );
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
      oscillator.onended = () => ctx.close();
    } catch {}
  };
  return (
    <Context.Provider
      value={{
        profile,
        error,
        refresh,
        settings,
        setSettings,
        current,
        setCurrent,
        play,
      }}
    >
      {children}
    </Context.Provider>
  );
}
