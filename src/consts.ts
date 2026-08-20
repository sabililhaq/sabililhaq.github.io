// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Sabililhaq";
export const SITE_DESCRIPTION =
  "Software engineer at Samsung Indonesia. Backend, distributed systems, and a personal workshop.";
export const SITE_AUTHOR = "Sabililhaq";
export const SITE_SHORT_NAME = "Sabililhaq";
export const EMAIL = "sabililhaq.furqony@gmail.com";

export const SOCIALS = {
  linkedin: "https://www.linkedin.com/in/sabililhaq/",
  github: "https://github.com/sabililhaq",
  medium: "https://sabililhaq.medium.com/",
  email: `mailto:${EMAIL}`,
  hackerrank: "https://www.hackerrank.com/sabililhaqq",
  leetcode: "https://leetcode.com/sabililhaq/",
} as const;

export type MediumPost = {
  title: string;
  description: string;
  url: string;
  pubDate: Date;
};

export const MEDIUM_POSTS: MediumPost[] = [
  {
    title: "Bahasa Indonesia: Fundamental Machine Learning: Kunci Era Baru Teknologi",
    description:
      "Artikel ini memberikan pengetahuan/konsep dasar dan fundamental machine learning secara sederhana, tidak membahas sisi teknikal.",
    url: "https://medium.com/data-folks-indonesia/machine-learning-kunci-era-baru-teknologi-2a780254f6c1",
    pubDate: new Date(2022, 4, 25),
  },
  {
    title: "Drone as our future courier",
    description: "Technological disruption for conventional courier.",
    url: "https://sabililhaq.medium.com/drone-as-our-future-courier-bcc9290a1945",
    pubDate: new Date(2020, 10, 11),
  },
];

export type ProjectGroup = "now" | "shipped" | "earlier";

export type Project = {
  id: string;
  title: string;
  overview: string[];
  techStack: string;
  group: ProjectGroup;
  liveDemo?: string;
  sourceCode?: string;
  roadmap?: string;
};

export const PROJECTS: Project[] = [
  {
    id: "vim-dojo",
    title: "Vim Dojo",
    overview: [
      "A browser playground for VIM practice. It is not a beginner tutorial, you should already know the basics.",
      "The challenge set is open source. Anyone can add a case.",
    ],
    techStack: "TypeScript · CodeMirror · Vim",
    group: "now",
    liveDemo: "https://sabililhaq.com/vim",
    sourceCode: "https://github.com/sabililhaq/vim-dojo",
    roadmap: "/vim/roadmap",
  },
  {
    id: "doktergpt",
    title: "DokterGPT",
    overview: [
      "WhatsApp-based medical chatbot featuring a curated medical database, dose calculator, clinical guidelines, and an AI layer. Content and workflows verified by clinicians and doctors.",
      'Actively used by 3,000+ users as of Q1 2026. Built in collaboration with <a href="https://sejawatidn.com/" target="_blank" rel="noopener noreferrer">Sejawat IDN</a> and <a href="https://hecolab.id/" target="_blank" rel="noopener noreferrer">HecoLab</a>, leading bimbel platforms for medical students in Indonesia.',
    ],
    techStack: "WhatsApp · AI/LLM · Medical Database",
    group: "shipped",
    liveDemo: "https://doktergpt.id/",
  },
  {
    id: "obscenity-id",
    title: "Obscenity Bahasa Indonesia",
    overview: [
      "Detects and blocks Indonesian badwords, slang, slurs, and obfuscated variants that English-only filters miss. Obscenity fork supports leet/variation transformations before matching, so you don't have to list every variation.",
      'Got a toxic friend? Point them <a href="https://github.com/sabililhaq/obscenity/tree/indonesian#obscenity-bahasa-indonesia" target="_blank" rel="noopener noreferrer">here</a>, turn toxicity into something useful :p',
      "⚠️ Trigger warning: contains explicit/offensive words.",
    ],
    techStack: "TypeScript · Obscenity · Node.js",
    group: "shipped",
    liveDemo: "https://sabililhaq.com/chat",
    sourceCode: "https://github.com/sabililhaq/obscenity/tree/indonesian",
  },
  {
    id: "travelokaocr",
    title: "TravelokaOCR",
    overview: [
      "Building mobile apps to scan user's ID (KTP) for faster administration (KYC). Implementing computer vision machine learning algorithm, OCR (Optical Character Recognition).",
      "Google Bangkit Academy 2022 company-based capstone project, hosted by Traveloka.",
    ],
    techStack: "TensorFlow · GCP · Kotlin · Firebase · PostgreSQL",
    group: "earlier",
    liveDemo:
      "https://capstone-bangkit-c22-ky01.github.io/traveloka-ocr-landingpage/",
  },
  {
    id: "dass-analytics",
    title: "DASS Analytics",
    overview: [
      "Website-based application to predict a person's level of Depression, Anxiety, and Stress.",
      "Building machine learning models based on the DASS public dataset as a data science course final project, including data dashboarding.",
    ],
    techStack: "Python · Scikit-learn · Streamlit",
    group: "earlier",
    sourceCode: "https://github.com/Erland366/Streamlit-Stress-Analytics",
  },
  {
    id: "nguli-id",
    title: "Nguli.id",
    overview: [
      "Website-based marketplace connecting construction workers and foremen.",
    ],
    techStack: "PHP · Laravel · MySQL · Bootstrap",
    group: "earlier",
    sourceCode: "https://github.com/sabililhaq/aplikasi_kuli",
  },
];

export const PROJECT_GROUPS: { id: ProjectGroup; label: string }[] = [
  { id: "now", label: "Now" },
  { id: "shipped", label: "Shipped" },
  { id: "earlier", label: "Earlier" },
];

export type RoadmapStatus = "next" | "later";

export type RoadmapItem = {
  id: string;
  title: string;
  status: RoadmapStatus;
  summary: string;
};

export const ROADMAP_GROUPS: { id: RoadmapStatus; label: string }[] = [
  { id: "next", label: "Next" },
  { id: "later", label: "Later" },
];

export const VIM_DOJO_ROADMAP: RoadmapItem[] = [
  {
    id: "category-play",
    title: "Play by category",
    status: "next",
    summary:
      "Stay inside one category. ?category=motion loads only that set. Next and Previous stay in the filter.",
  },
  {
    id: "random",
    title: "Randomized practice",
    status: "next",
    summary:
      "Shuffle remaining unsolved cases, optionally inside a category. For review, not first-time play.",
  },
  {
    id: "daily",
    title: "Daily kata",
    status: "next",
    summary:
      "One deterministic case per UTC day, same for everyone. No streak counter. Stored locally as today's date.",
  },
  {
    id: "interactive-hints",
    title: "Interactive hints",
    status: "next",
    summary:
      "Teach in the buffer: highlight the span that must change, then ghost the next intended key. Text hints stay as layer one.",
  },
  {
    id: "more-categories",
    title: "Counts and macros",
    status: "later",
    summary:
      "New category files after the learning modes exist. Search and replace already have their own files.",
  },
];

export type Lab = {
  label: string;
  url: string;
  description: string;
  note?: string;
};

export const LABS: Lab[] = [
  {
    label: "Chat",
    url: "/chat",
    description: "Anonymous, temporary chat",
    note: "single room, messages expire",
  },
  {
    label: "Vim Dojo",
    url: "/vim",
    description: "Practice Vim. Don't learn Vim.",
    note: "I use this",
  },
  {
    label: "Files",
    url: "https://files.sabililhaq.com",
    description: "My public read only file system",
    note: "I use this",
  },
  {
    label: "Excalidraw",
    url: "https://draw.sabililhaq.com",
    description: "Whiteboard playground",
    note: "playground",
  },
  {
    label: "URL Shortener",
    url: "https://go.sabililhaq.com",
    description: "Personal URL shortener",
    note: "I use this",
  },
  {
    label: "QR Code Generator",
    url: "/qr",
    description: "Generate QR codes instantly from URL",
    note: "runs in the browser",
  },
  {
    label: "Terbilang",
    url: "/terbilang",
    description: "Turn numbers into Indonesian words",
    note: "runs in the browser",
  },
];

export type SkillGroup = {
  label: string;
  items: string[];
};

export const SKILLS: SkillGroup[] = [
  {
    label: "Backend & systems",
    items: ["Go", "TypeScript", "Node.js", "Docker", "AWS"],
  },
  {
    label: "Languages",
    items: ["Python", "Java", "JavaScript"],
  },
  {
    label: "Also",
    items: ["Kotlin", "PHP", "Laravel", "TensorFlow", "MySQL"],
  },
];
