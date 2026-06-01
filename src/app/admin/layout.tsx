import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import AdminSidebar from "@/admin/components/AdminSidebar";

const AUTH_PATHS = ["/admin/login", "/admin/signup", "/admin/forgot-password", "/admin/reset-password", "/admin/unauthorized"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render shell only when logged in + on the allowlist.
  // The login/signup pages render with no shell.
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in → middleware already redirects to /admin/login.
  // If we got here without a user, we're ON an auth page → render bare children.
  if (!user || !user.email) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {children}
      </div>
    );
  }

  // Check admin allowlist
  const { data: allow } = await supabase
    .from("admin_emails")
    .select("email, role")
    .eq("email", user.email.toLowerCase())
    .is("deleted_at", null)
    .maybeSingle();

  if (!allow) {
    // Logged in but not allowed → redirect to unauthorized page
    redirect("/admin/unauthorized");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar email={user.email} />
      <main className="ml-60">
        {children}
      </main>
    </div>
  );
}

// Helper used in middleware too — kept here as a reference
export { AUTH_PATHS };
