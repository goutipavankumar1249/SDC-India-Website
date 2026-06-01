import { z } from "zod";

const SECTIONS = ["Founder", "Board", "Tech", "Core", "Alumni"] as const;

const optStr = z.string().trim().optional().nullable().transform((v) => (v && v.length > 0 ? v : null));
const optUrl = z.string().trim().url().optional().nullable().or(z.literal("")).transform((v) => (v && v.length > 0 ? v : null));

export const teamMemberSchema = z.object({
  initials:      z.string().trim().min(1).max(4, "Initials must be 1–4 characters"),
  name:          z.string().trim().min(2).max(120),
  role:          z.string().trim().min(2).max(120),
  bio:           optStr,
  skills:        z.array(z.string().trim()).default([]),
  impact:        optStr,
  gradient:      optStr,
  section:       z.enum(SECTIONS).default("Core"),
  photo_url:     optStr,
  github_url:    optUrl,
  linkedin_url:  optUrl,
  twitter_url:   optUrl,
  email:         z.string().trim().toLowerCase().email().optional().nullable().or(z.literal("")).transform((v) => (v && v.length > 0 ? v : null)),
  is_published:  z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().default(100),
  slug:          optStr,
});
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

export function parseTeamMemberFormData(fd: FormData): unknown {
  const get = (k: string) => {
    const v = fd.get(k);
    return v === null ? undefined : typeof v === "string" ? v : undefined;
  };
  const arr = (k: string) =>
    (fd.get(k) as string ?? "")
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  return {
    initials:      get("initials"),
    name:          get("name"),
    role:          get("role"),
    bio:           get("bio"),
    skills:        arr("skills"),
    impact:        get("impact"),
    gradient:      get("gradient"),
    section:       get("section") || "Core",
    photo_url:     get("photo_url"),
    github_url:    get("github_url"),
    linkedin_url:  get("linkedin_url"),
    twitter_url:   get("twitter_url"),
    email:         get("email"),
    is_published:  fd.get("is_published") === "on",
    display_order: get("display_order") ?? "100",
    slug:          get("slug"),
  };
}
