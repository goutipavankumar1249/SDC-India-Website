import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server-side guard: ensures the request is from an authenticated admin.
 * Use at the top of any /admin/* server component.
 *
 * Returns: { user, email, role } if authorized.
 * Redirects to /admin/login if not logged in.
 * Redirects to /admin/unauthorized if logged in but not in admin_emails.
 */
export async function requireAdmin() {
  const supabase = await getSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    redirect("/admin/login");
  }

  // Check the admin_emails allowlist
  const { data: allow, error } = await supabase
    .from("admin_emails")
    .select("email, role")
    .eq("email", user.email.toLowerCase())
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !allow) {
    redirect("/admin/unauthorized");
  }

  return {
    user,
    email: user.email,
    role: allow.role as "admin" | "editor" | "viewer",
  };
}

/**
 * Soft check — returns null if not admin (no redirect).
 * Use when you want to conditionally show admin UI.
 */
export async function getAdminOrNull() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data: allow } = await supabase
    .from("admin_emails")
    .select("email, role")
    .eq("email", user.email.toLowerCase())
    .is("deleted_at", null)
    .maybeSingle();

  if (!allow) return null;
  return { user, email: user.email, role: allow.role };
}
