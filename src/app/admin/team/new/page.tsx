import { requireAdmin } from "@/admin/lib/auth";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import TeamMemberForm from "@/admin/components/TeamMemberForm";

export const metadata = { title: "New team member · Admin" };

export default async function NewTeamMemberPage() {
  await requireAdmin();
  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/team" label="All team members" />
      <PageHeader label="New member" title="Add team member" />
      <TeamMemberForm />
    </div>
  );
}
