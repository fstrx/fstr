export type Project = {
  name: string;
  /** one honest line. no metrics, no hype. */
  about: string;
  tags: string[];
  role?: string;
  lang?: string;
  status?: string;
  /** leave undefined until there's a real url */
  link?: string;
};

export const projects: Project[] = [
  {
    name: "Aedura",
    about: "my current startup. ai for education: helping students know what to study next. starting with cbse.",
    role: "Co-Founder & CTO",
    status: "building",
    tags: ["ai", "education"],
    link: "https://aedura.in",
  },
  {
    name: "DFNC Labs",
    about: "applied ai, systems, and personal knowledge infrastructure.",
    tags: ["ai", "systems", "knowledge"],
  },
  {
    name: "cpu-ml",
    about: "neural network engine in c, with manual memory management and backpropagation.",
    lang: "c",
    tags: ["ml", "from scratch"],
    link: "https://github.com/fstrx/cpu-ml",
  },
  {
    name: "commx",
    about: "small-group p2p communication where the room itself is disposable.",
    lang: "rust",
    tags: ["p2p", "networking"],
    link: "https://github.com/fstrx/commx",
  },
  {
    name: "robotics",
    about: "hardware, robotics, and general experimentation. things that move (sometimes).",
    tags: ["hardware", "robotics"],
  },
];
