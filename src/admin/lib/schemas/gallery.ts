import { z } from "zod";

const optStr = z.string().trim().optional().nullable().transform((v) => (v && v.length > 0 ? v : null));

export const galleryImageSchema = z.object({
  image_url:     z.string().trim().min(1, "Image URL is required").max(500),
  alt_text:      optStr,
  caption:       optStr,
  span_classes:  z.string().trim().default("aspect-square"),
  event_id:      optStr,
  is_published:  z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().default(100),
});
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;

export function parseGalleryFormData(fd: FormData): unknown {
  const get = (k: string) => {
    const v = fd.get(k);
    return v === null ? undefined : typeof v === "string" ? v : undefined;
  };
  return {
    image_url:     get("image_url"),
    alt_text:      get("alt_text"),
    caption:       get("caption"),
    span_classes:  get("span_classes") || "aspect-square",
    event_id:      get("event_id"),
    is_published:  fd.get("is_published") === "on",
    display_order: get("display_order") ?? "100",
  };
}
