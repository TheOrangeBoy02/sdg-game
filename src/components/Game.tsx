"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IDLE_RESET_SECONDS, THEMES, type ThemeId } from "@/lib/content";
import { resolveTheme } from "@/lib/scoring";
import type { Stroke } from "@/lib/strokes";
import { useIdle } from "@/lib/useIdle";
import BrandBar from "./BrandBar";
import Welcome from "./screens/Welcome";
import NameEntry from "./screens/NameEntry";
import Quiz from "./screens/Quiz";
import Draw from "./screens/Draw";
import Reveal from "./screens/Reveal";

type Stage = "welcome" | "name" | "quiz" | "draw" | "reveal";

export default function Game() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [round, setRound] = useState(0); // bump to remount everything on reset
  const [name, setName] = useState("");
  const [themeId, setThemeId] = useState<ThemeId | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  const reset = useCallback(() => {
    strokesRef.current = [];
    setStrokes([]);
    setName("");
    setThemeId(null);
    setStage("welcome");
    setRound((r) => r + 1);
  }, []);

  // Kiosk hardening: block pinch-zoom and the iOS context menu
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", stop);
    document.addEventListener("contextmenu", stop);
    return () => {
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("contextmenu", stop);
    };
  }, []);

  // Auto-reset when a player walks away (not during the timed drawing)
  const idleActive = stage !== "welcome" && stage !== "draw";
  const idleLeft = useIdle(idleActive, IDLE_RESET_SECONDS, reset);

  const theme = themeId ? THEMES[themeId] : null;

  const finishDrawing = useCallback(() => {
    setStrokes([...strokesRef.current]);
    setStage("reveal");
  }, []);

  return (
    <main className="kiosk flex flex-col" key={round}>
      <BrandBar onStaffReset={reset} />

      {stage === "welcome" && <Welcome onStart={() => setStage("name")} />}

      {stage === "name" && (
        <NameEntry
          onDone={(n) => {
            setName(n);
            setStage("quiz");
          }}
        />
      )}

      {stage === "quiz" && (
        <Quiz
          onDone={(answers) => {
            setThemeId(resolveTheme(answers));
            setStage("draw");
          }}
        />
      )}

      {stage === "draw" && theme && <Draw theme={theme} strokesRef={strokesRef} onDone={finishDrawing} />}

      {stage === "reveal" && theme && <Reveal theme={theme} strokes={strokes} name={name} onNext={reset} />}

      {idleActive && idleLeft <= 10 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[3vh] flex justify-center">
          <div className="rounded-full bg-black/60 px-6 py-3 text-[2.2vh] font-bold backdrop-blur">
            Still there? Restarting in {Math.max(0, idleLeft)}s. Tap anywhere to stay.
          </div>
        </div>
      )}
    </main>
  );
}
