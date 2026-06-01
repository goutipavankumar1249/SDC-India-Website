import { z } from "zod";

const CATEGORIES = ["article", "event", "growth", "community", "digital", "tutorial", "announcement"] as const;
const optStr = z.string().trim().optional().nullable().transform((v) => (v && v.length > 0 ? v : null));
const optDate = z.string().optional().nullable().transform((v) => (v && v.length > 0 ? v : null));

export const blogContentBlockSchema = z.object({
  title:      z.string().trim().optional(),
  paragraphs: z.array(z.string().trim()).default([]),
  bullets:    z.array(z.string().trim()).default([]),
  quote:      z.string().trim().optional(),
});

export const blogPostSchema = z.object({
  slug:            z.string().trim().min(1, "Slug is required").max(120),
  title:           z.string().trim().min(3).max(200),
  category:        z.enum(CATEGORIES).default("article"),
  publish_date:    optDate,
  read_time:       optStr,
  cover_image_url: optStr,
  excerpt:         optStr,
  content_blocks:  z.array(blogContentBlockSchema).default([]),
  is_published:    z.coerce.boolean().default(false),
  display_order:   z.coerce.number().int().default(100),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;

/**
 * The form's `content_blocks` field is a hidden JSON-encoded string
 * produced by the client-side BlockEditor. We just JSON.parse it here.
 */
export function parseBlogPostFormData(fd: FormData): unknown {
  const get = (k: string) => {
    const v = fd.get(k);
    return v === null ? undefined : typeof v === "string" ? v : undefined;
  };
  let blocks: unknown = [];
  const blocksRaw = get("content_blocks");
  if (blocksRaw) {
    try { blocks = JSON.parse(blocksRaw); } catch { blocks = []; }
  }
  return {
    slug:            get("slug"),
    title:           get("title"),
    category:        get("category") || "article",
    publish_date:    get("publish_date"),
    read_time:       get("read_time"),
    cover_image_url: get("cover_image_url"),
    excerpt:         get("excerpt"),
    content_blocks:  blocks,
    is_published:    fd.get("is_published") === "on",
    display_order:   get("display_order") ?? "100",
  };
}
