import type { BlogPostRow } from "@/lib/supabase/database.types";
import type { BlogPost } from "@/types/blog";

export function mapRowToBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.slug,
    title: row.title,
    category: row.category,
    date: row.publish_date
      ? new Date(row.publish_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "",
    readTime: row.read_time ?? "—",
    coverImage: row.cover_image_url ?? "/assets/blog/sdc-india-logo.jpeg",
    excerpt: row.excerpt ?? "",
    content: row.content_blocks ?? [],
  };
}
