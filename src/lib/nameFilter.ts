// Blocklist for the optional first name. Cards are public and players are minors.
// The name only exists on the client (it is drawn into the PNG), so the check lives here.
// Input has already been reduced to letters, spaces, apostrophes and hyphens.

// Matched anywhere in the name, ignoring spaces, apostrophes and hyphens
const ANYWHERE = [
  "fuck", "cunt", "bitch", "whore", "slut", "wank", "piss", "porn", "penis", "vagina",
  "dildo", "boob", "nigger", "nigga", "faggot", "retard", "hitler", "kaffir", "poes",
  "fokof", "msunu", "bastard", "bollock", "twat",
];

// Matched only as a whole word, because they appear inside real names (Cassie, Titus, Nazia, Nashita)
const WHOLE_WORD = [
  "ass", "arse", "shit", "shitty", "bullshit", "tit", "tits", "cum", "cock", "dick", "sex",
  "sexy", "rape", "nazi", "fag", "fok", "kak", "naai", "poep", "poo", "poop", "crap", "damn",
  "hell", "butt", "anus", "pussy", "jerk", "idiot", "stupid", "loser", "dumb", "kill",
];

// Each letter may repeat ("fuuuck"), which is the usual way around a list like this
const pattern = (w: string) => [...w].map((c) => `${c}+`).join("");
const anywhereRe = new RegExp(ANYWHERE.map(pattern).join("|"));
const wholeWordRe = new RegExp(`^(?:${WHOLE_WORD.map(pattern).join("|")})$`);

const fold = (v: string) => v.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function isBlockedName(name: string) {
  const folded = fold(name);
  const words = folded.split(/[\s'-]+/).filter(Boolean);
  const joined = words.join("");
  return anywhereRe.test(joined) || wholeWordRe.test(joined) || words.some((w) => wholeWordRe.test(w));
}
