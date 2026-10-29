// All editable copy for the game lives here.
// Swap event branding, questions, identities and messages without touching UI code.

export const EVENT = {
  title: "",
  subtitle: "Find your SDG. Draw it. Share it.",
  eventName: "Standard Bank SDG Experience", // TODO: replace with the real event name
  hashtag: "#DiscoverYourImpact", // TODO: replace with the event hashtag
  consent:
    "Your card (drawing and optional first name) is saved online so you can download it with the QR code, and may be shown by the organisers.",
};

// The event runs under the Sustainability Academy. White crest, for dark backgrounds only.
export const ACADEMY_LOGO = "/brand/SDG/Sustainability Academy.png";

export const DRAW_SECONDS = 30;
export const IDLE_RESET_SECONDS = 90;

export type ThemeId =
  | "climate"
  | "forests"
  | "water"
  | "education"
  | "energy"
  | "communities";

export type Theme = {
  id: ThemeId;
  identity: string; // shown as "MEET THE {identity}"
  sdgNumber: number;
  sdgName: string;
  color: string; // official SDG colour
  sdgIcon: string; // official UN SDG icon in /public/brand/SDG
  sketchPrompt: string;
  belief: string;
  mission: string;
};

// Fixed order is also the final tie-break, so results are always deterministic.
export const THEMES: Record<ThemeId, Theme> = {
  climate: {
    id: "climate",
    identity: "Planet Protector",
    sdgNumber: 13,
    sdgName: "Climate Action",
    color: "#3F7E44",
    sdgIcon: "/brand/SDG/TGG_Icon_Color_13.png",
    sketchPrompt: "Sketch the Earth",
    belief: "You believe a better future begins with protecting the world around us.",
    mission: "Help build a greener, more sustainable planet.",
  },
  forests: {
    id: "forests",
    identity: "Forest Guardian",
    sdgNumber: 15,
    sdgName: "Life on Land",
    color: "#56C02B",
    sdgIcon: "/brand/SDG/TGG_Icon_Color_15.png",
    sketchPrompt: "Sketch a tree",
    belief: "You see the forests, the wildlife and the land as something worth fighting for.",
    mission: "Plant, protect and restore the living world.",
  },
  water: {
    id: "water",
    identity: "Water Champion",
    sdgNumber: 6,
    sdgName: "Clean Water and Sanitation",
    color: "#26BDE2",
    sdgIcon: "/brand/SDG/TGG_Icon_Color_06.png",
    sketchPrompt: "Sketch a water droplet",
    belief: "You know that clean water is where health, dignity and opportunity begin.",
    mission: "Make safe, clean water a reality for every home.",
  },
  education: {
    id: "education",
    identity: "Knowledge Builder",
    sdgNumber: 4,
    sdgName: "Quality Education",
    color: "#C5192D",
    sdgIcon: "/brand/SDG/SDG 4.png",
    sketchPrompt: "Sketch a book",
    belief: "You believe that learning is the key that opens every other door.",
    mission: "Make sure every young person gets the chance to learn.",
  },
  energy: {
    id: "energy",
    identity: "Energy Innovator",
    sdgNumber: 7,
    sdgName: "Affordable and Clean Energy",
    color: "#FCC30B",
    sdgIcon: "/brand/SDG/TGG_Icon_Color_07.png",
    sketchPrompt: "Sketch the sun",
    belief: "You see bright ideas everywhere and want to power the future cleanly.",
    mission: "Bring clean, affordable energy to more people.",
  },
  communities: {
    id: "communities",
    identity: "Community Architect",
    sdgNumber: 11,
    sdgName: "Sustainable Cities and Communities",
    color: "#FD9D24",
    sdgIcon: "/brand/SDG/TGG_Icon_Color_11.png",
    sketchPrompt: "Sketch a house",
    belief: "You believe strong, safe communities are built when everyone is included.",
    mission: "Help build places where everyone can live and thrive.",
  },
};

export const THEME_ORDER: ThemeId[] = [
  "climate",
  "forests",
  "water",
  "education",
  "energy",
  "communities",
];

// Welcome screen: every official SDG icon, cycled 6 at a time.
// SDG 5 (Gender Equality) is not in /public/brand/SDG yet: add the file, then its entry here.
export const SDG_ICONS: { number: number; src: string }[] = [
  { number: 1, src: "/brand/SDG/SDG 1.png" },
  { number: 2, src: "/brand/SDG/SDG 2.png" },
  { number: 3, src: "/brand/SDG/SDG 3.png" },
  { number: 4, src: "/brand/SDG/SDG 4.png" },
  ...[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((n) => ({
    number: n,
    src: `/brand/SDG/TGG_Icon_Color_${String(n).padStart(2, "0")}.png`,
  })),
];
export const WELCOME_PAGE_SECONDS = 5; // how long each set of 6 stays on screen

export type Answer = {
  label: string;
  primary: ThemeId; // +3
  secondary?: ThemeId; // +1
};

export type Question = {
  prompt: string;
  answers: [Answer, Answer, Answer, Answer];
};

export const QUESTIONS: Question[] = [
  {
    prompt: "If you could make one change to the world, what would it be?",
    answers: [
      { label: "Protect forests and wildlife", primary: "forests", secondary: "climate" },
      { label: "Make clean water accessible to everyone", primary: "water", secondary: "communities" },
      { label: "Give every child access to education", primary: "education", secondary: "communities" },
      { label: "Make clean energy available to more people", primary: "energy", secondary: "climate" },
    ],
  },
  {
    prompt: "Pick your perfect Saturday.",
    answers: [
      { label: "Hiking and exploring outdoors", primary: "forests", secondary: "climate" },
      { label: "Building or fixing something with friends", primary: "communities", secondary: "energy" },
      { label: "Swimming or chilling by the lake", primary: "water", secondary: "forests" },
      { label: "Learning a new skill or teaching one", primary: "education" },
    ],
  },
  {
    prompt: "Which superpower would you choose?",
    answers: [
      { label: "Turn sunlight into power for any home", primary: "energy", secondary: "communities" },
      { label: "Control the weather", primary: "climate", secondary: "water" },
      { label: "Learn any language or skill instantly", primary: "education" },
      { label: "Clean any river or lake with one touch", primary: "water", secondary: "forests" },
    ],
  },
  {
    prompt: "What worries you most about the future?",
    answers: [
      { label: "Floods, droughts and extreme weather", primary: "climate", secondary: "water" },
      { label: "Disappearing forests and animals", primary: "forests", secondary: "climate" },
      { label: "Homes and schools without electricity", primary: "energy", secondary: "education" },
      { label: "Towns without safe homes or good services", primary: "communities", secondary: "education" },
    ],
  },
  {
    prompt: "In a team project, you are the one who...",
    answers: [
      { label: "Makes sure everyone is included", primary: "communities", secondary: "education" },
      { label: "Thinks about the impact on the planet", primary: "climate", secondary: "forests" },
      { label: "Comes up with the big, bold ideas", primary: "energy", secondary: "climate" },
      { label: "Explains things so everyone gets it", primary: "education" },
    ],
  },
];
