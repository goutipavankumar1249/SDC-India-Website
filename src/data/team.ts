export type TeamSection = "Founder" | "Board" | "Tech" | "Core" | "Alumni";

export interface TeamMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  bio: string;
  skills: string[];
  impact: string;
  gradient: string;
  section: TeamSection;
  github?: string;
  linkedin?: string;
}

/* ──────────────────────────────────────────────────────────
   Real SDC INDIA team members.
   Sources:
   - Chandrashekhar M → blog.ts ("SDC was founded by Mr. Chandrashekhar M,
     a SNIST alumnus from the 2021–2024 batch")
   - Pavan Kumar, Rithwik, Bhavitha, Shashank → community-pulse.json
     (real GitHub contributors to SDC repos)

   TODO: roles/bios for contributors are placeholder — provide real
   titles/bios and re-edit this file.
─────────────────────────────────────────────────────────── */
export const TEAM: TeamMember[] = [
  {
    id: "chandrashekhar-m",
    initials: "CM",
    name: "Chandrashekhar M",
    role: "Founder",
    bio: "Founded SDC in 2022 at Sreenidhi Institute of Science and Technology (SNIST). A SNIST alumnus from the 2021–2024 batch, his vision was to create a space where students could grow technically through collaboration and hands-on learning — moving beyond classroom theory into real-world technology. Under his leadership, SDC has grown to 2500+ members with a national footprint as SDC INDIA.",
    skills: ["Community Building", "Vision", "Mentorship", "Leadership", "Event Strategy"],
    impact: "Founded SDC · Grew it to 2500+ members",
    gradient: "linear-gradient(135deg,#e84393,#f97316)",
    section: "Founder",
  },

  // Core contributors — real GitHub logins from community-pulse.json
  {
    id: "pavan-kumar",
    initials: "PK",
    name: "Pavan Kumar",
    role: "Core Contributor",
    bio: "Active contributor to SDC INDIA's open-source projects and community platforms. Works on the SDC website and developer tooling.",
    skills: ["Web Development", "TypeScript", "React", "Open Source"],
    impact: "SDC INDIA website & tooling",
    gradient: "linear-gradient(135deg,#22c55e,#06b6d4)",
    section: "Core",
    github: "https://github.com/goutipavankumar1249",
  },
  {
    id: "rithwik",
    initials: "RT",
    name: "Rithwik",
    role: "Core Contributor",
    bio: "Active contributor to SDC INDIA's GitHub repositories. Part of the team driving open-source initiatives within the community.",
    skills: ["Development", "Open Source", "Collaboration"],
    impact: "Open-source contributions",
    gradient: "linear-gradient(135deg,#a855f7,#e84393)",
    section: "Core",
    github: "https://github.com/Rithwik29102006",
  },
  {
    id: "bhavitha",
    initials: "BH",
    name: "Bhavitha",
    role: "Core Contributor",
    bio: "Contributor to SDC INDIA's projects, focused on building and maintaining community-driven open-source work.",
    skills: ["Development", "Open Source", "Collaboration"],
    impact: "Project contributions",
    gradient: "linear-gradient(135deg,#f97316,#a855f7)",
    section: "Core",
    github: "https://github.com/bhavitha-1306",
  },
  {
    id: "shashank-puram",
    initials: "SP",
    name: "Shashank Puram",
    role: "Core Contributor",
    bio: "Contributor to SDC INDIA's open-source repositories and engineering initiatives.",
    skills: ["Development", "Open Source", "Engineering"],
    impact: "Engineering contributions",
    gradient: "linear-gradient(135deg,#06b6d4,#f59e0b)",
    section: "Core",
    github: "https://github.com/ShashankPuram",
  },
];

export const FOUNDER = TEAM.filter((m) => m.section === "Founder");
export const CORE_TEAM = TEAM.filter((m) => m.section === "Core");

/* Backwards-compatible exports for pages that still reference these */
export const BOARD = FOUNDER;
export const TECH_LEADS: TeamMember[] = [];

export function getTeamMember(id: string): TeamMember | undefined {
  return TEAM.find((m) => m.id === id);
}
