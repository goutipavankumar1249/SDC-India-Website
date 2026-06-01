import { z } from "zod";

const TIERS = ["platinum", "gold", "silver", "standard"] as const;
const optStr = z.string().trim().optional().nullable().transform((v) => (v && v.length > 0 ? v : null));
const optUrl = z.string().trim().url().optional().nullable().or(z.literal("")).transform((v) => (v && v.length > 0 ? v : null));

export const partnerSchema = z.object({
  name:          z.string().trim().min(2).max(120),
  logo_url:      z.string().trim().min(1, "Logo URL is required").max(500),
  website_url:   optUrl,
  description:   optStr,
  tier:          z.enum(TIERS).default("standard"),
  is_published:  z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().default(100),
  slug:          optStr,
});
export type PartnerInput = z.infer<typeof partnerSchema>;

export function parsePartnerFormData(fd: FormData): unknown {
  const get = (k: string) => {
    const v = fd.get(k);
    return v === null ? undefined : typeof v === "string" ? v : undefined;
  };
  return {
    name:          get("name"),
    logo_url:      get("logo_url"),
    website_url:   get("website_url"),
    description:   get("description"),
    tier:          get("tier") || "standard",
    is_published:  fd.get("is_published") === "on",
    display_order: get("display_order") ?? "100",
    slug:          get("slug"),
  };
}
