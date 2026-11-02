/**
 * Roles, newest first (by start date). `to` undefined = still doing it.
 * Dates are "YYYY-MM". Keep `about` to one honest line.
 */
export type Role = {
  role: string;
  org: string;
  from: string;
  to?: string;
  where?: string;
  about?: string;
};

export const experience: Role[] = [
  {
    role: "Co-Founder & CTO",
    org: "Aedura Education",
    from: "2025-10",
    where: "bhopal · hybrid",
  },
  {
    role: "Founder",
    org: "Deutero AI",
    from: "2025-03",
    to: "2025-09",
    about: "experimental context-aware ai system focused on persistent memory and personalized cognition.",
  },
  {
    role: "CTO",
    org: "Trosbo Robotics",
    from: "2023-05",
    to: "2024-09",
    about: "led software for robotics projects: system architecture, embedded software, engineering workflows.",
  },
  {
    role: "President",
    org: "Headway's TechClub @ DPS Kolar",
    from: "2023-04",
    where: "on-site",
    about: "running one of the school's largest student-led tech communities: events, workshops, hackathons, mentorship.",
  },
  {
    role: "Bug Bounty & Security Research",
    org: "Stealth",
    from: "2022-03",
    to: "2023-02",
    where: "remote",
  },
];

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "2025-10" → "oct 2025" */
export function fmtMonth(ym: string) {
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}
