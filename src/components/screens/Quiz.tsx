"use client";

import { useRef, useState } from "react";
import { QUESTIONS } from "@/lib/content";

const LETTERS = ["A", "B", "C", "D"];
const ACCENTS = ["#0051FF", "#26BDE2", "#56C02B", "#FCC30B"];

export default function Quiz({ onDone }: { onDone: (answers: number[]) => void }) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const busy = useRef(false);
  const qi = answers.length;
  const q = QUESTIONS[qi];

  const choose = (i: number) => {
    if (busy.current) return; // ignore double taps
    busy.current = true;
    setPicked(i);
    window.setTimeout(() => {
      const next = [...answers, i];
      setPicked(null);
      busy.current = false;
      if (next.length === QUESTIONS.length) onDone(next);
      else setAnswers(next);
    }, 280);
  };

  const back = () => {
    if (busy.current || qi === 0) return;
    setAnswers(answers.slice(0, -1));
  };

  if (!q) return null;

  return (
    <div className="flex flex-1 flex-col px-[5vw] pb-[5vh]">
      <div className="flex items-center pt-12 gap-[1.5vw]">
        <button
          onClick={back}
          disabled={qi === 0}
          className="rounded-full border-2 border-white/30 px-[2vw] py-[1.2vh] text-[2.2vh] font-bold disabled:opacity-0"
        >
          Back
        </button>
        <span className="text-[2.2vh] font-bold text-white/70">
          {qi + 1} / {QUESTIONS.length}
        </span>
        <div className="flex flex-1 gap-[0.8vw]">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-[1.2vh] flex-1 rounded-full transition-colors ${i <= qi ? "bg-white" : "bg-white/20"}`}
            />
          ))}
        </div>
      </div>

      <h2 key={`q${qi}`} className="animate-rise mt-[5vh] max-w-[80vw] text-[5.6vh] font-bold leading-tight">
        {q.prompt}
      </h2>

      <div key={`a${qi}`} className="mt-[5vh] grid flex-1 grid-cols-2 gap-[2.4vh]">
        {q.answers.map((a, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            className={`animate-rise flex items-center gap-[2vw] rounded-[3vh] border-2 px-[2.5vw] text-left backdrop-blur-lg transition-all active:scale-[0.98] ${
              picked === i ? "scale-[1.02] border-white bg-white text-stature" : "border-white/15 bg-white/[0.07]"
            } ${picked !== null && picked !== i ? "opacity-70" : ""}`}
            style={{ animationDelay: `${80 + i * 60}ms` }}
          >
            <span
              className="flex h-[7vh] w-[7vh] shrink-0 items-center justify-center rounded-[1.8vh] text-[3.4vh] font-bold text-white"
              style={{ background: ACCENTS[i] }}
            >
              {LETTERS[i]}
            </span>
            <span className="text-[3vh] font-bold leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
