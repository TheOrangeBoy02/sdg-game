"use client";

import { useState } from "react";
import { isBlockedName } from "@/lib/nameFilter";

const MAX = 14;
const clean = (v: string) => v.replace(/[^\p{L}\s'-]/gu, "").replace(/\s+/g, " ").slice(0, MAX);

export default function NameEntry({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName] = useState("");
  const [blocked, setBlocked] = useState(false);
  const submit = () => {
    const n = name.trim();
    if (n && isBlockedName(n)) return setBlocked(true);
    onDone(n);
  };

  // Content sits in the top half so the iPad keyboard never covers it.
  return (
    <div className="flex flex-1 flex-col items-center px-[6vw] pt-[4vh] animate-rise">
      <h2 className="text-[6vh] font-bold">What should we call you?</h2>
      <p className="mt-[1vh] text-[2.4vh] text-white/70">First name only, it goes on your card. You can skip this.</p>
      <form
        className="mt-[4vh] flex w-full max-w-[60vw] gap-[1.5vw]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          value={name}
          onChange={(e) => {
            setName(clean(e.target.value));
            setBlocked(false);
          }}
          placeholder="Your first name"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="min-w-0 flex-1 rounded-full border-2 border-white/30 bg-white/10 px-[2.5vw] py-[2vh] text-[3.4vh] font-bold text-white outline-none placeholder:text-white/40 focus:border-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white px-[3vw] text-[3vh] font-bold text-stature active:scale-95"
        >
          {name.trim() ? "Next" : "Skip"}
        </button>
      </form>
      {blocked && (
        <p className="mt-[2.5vh] text-[2.6vh] font-bold text-white">
          Let&apos;s try a different name. Use your first name, or clear the box to skip.
        </p>
      )}
    </div>
  );
}
