import type { TeamMemberRow } from "@/lib/supabase/database.types";
import type { TeamMember } from "@/data/team";

/** Map a Supabase row to the shape <TeamCard /> expects. */
export function mapRowToTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.slug ?? row.id,
    initials: row.initials,
    name: row.name,
    role: row.role,
    bio: row.bio ?? "",
    skills: row.skills,
    impact: row.impact ?? "",
    gradient: row.gradient ?? "linear-gradient(135deg,#e84393,#f97316)",
    section: row.section,
    github: row.github_url ?? undefined,
    linkedin: row.linkedin_url ?? undefined,
  };
}
