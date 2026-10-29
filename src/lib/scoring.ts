import { QUESTIONS, THEME_ORDER, type ThemeId } from "./content";

export const PRIMARY_POINTS = 3;
export const SECONDARY_POINTS = 1;

/** answers[i] = index of the chosen answer for QUESTIONS[i] */
export function scoreAnswers(answers: number[]): Record<ThemeId, number> {
  const scores = Object.fromEntries(THEME_ORDER.map((t) => [t, 0])) as Record<ThemeId, number>;
  answers.forEach((choice, qi) => {
    const a = QUESTIONS[qi]?.answers[choice];
    if (!a) return;
    scores[a.primary] += PRIMARY_POINTS;
    if (a.secondary) scores[a.secondary] += SECONDARY_POINTS;
  });
  return scores;
}

/**
 * Deterministic result:
 * 1. Highest score wins.
 * 2. Tie: the tied theme picked most recently as a primary answer wins.
 * 3. Still tied: fixed THEME_ORDER.
 */
export function resolveTheme(answers: number[]): ThemeId {
  const scores = scoreAnswers(answers);
  const max = Math.max(...THEME_ORDER.map((t) => scores[t]));
  const tied = THEME_ORDER.filter((t) => scores[t] === max);
  if (tied.length === 1) return tied[0];

  for (let qi = answers.length - 1; qi >= 0; qi--) {
    const p = QUESTIONS[qi]?.answers[answers[qi]]?.primary;
    if (p && tied.includes(p)) return p;
  }
  return tied[0];
}
