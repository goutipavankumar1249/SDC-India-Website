"use server";

import { requireAdmin } from "@/admin/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type UploadResult =
  | { ok: true; publicUrl: string; path: string }
  | { ok: false; error: string };

/**
 * Uploads a file to the sdc-public bucket and returns its public URL.
 * The path is built from (folder, sanitized-original-name, timestamp).
 *
 * Allowed mime types are restricted by the bucket policy (SQL) to images only.
 * 10 MB max.
 */
export async function uploadImageAction(
  folder: string,
  formData: FormData
): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };

  // Sanitize folder + filename
  const safeFolder = folder.replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "misc";
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 60);
  const timestamp = Date.now();
  const path = `${safeFolder}/${base || "image"}-${timestamp}.${ext}`;

  const supabase = await getSupabaseServerClient();

  const { error: uploadError } = await supabase.storage
    .from("sdc-public")
    .upload(path, file, {
      cacheControl: "31536000",        // 1 year
      contentType: file.type || undefined,
      upsert: false,
    });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data } = supabase.storage.from("sdc-public").getPublicUrl(path);

  // Track in media_assets (best-effort — don't fail the upload if this fails)
  await supabase.from("media_assets").insert({
    storage_path: path,
    bucket: "sdc-public",
    public_url: data.publicUrl,
    mime_type: file.type || null,
    size_bytes: file.size,
  });

  return { ok: true, publicUrl: data.publicUrl, path };
}
