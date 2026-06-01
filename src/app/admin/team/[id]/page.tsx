import { notFound } from "next/navigation";
import { requireAdmin } from "@/admin/lib/auth";
import { adminGetTeamMember } from "@/admin/lib/data/team";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import TeamMemberForm from "@/admin/components/TeamMemberForm";

export const metadata = { title: "Edit team member · Admin" };

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const member = await adminGetTeamMember(id);
  if (!member) return notFound();

  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/team" label="All team members" />
      <PageHeader
        label="Edit member"
        title={member.name}
        description={`${member.section} · last updated ${new Date(member.updated_at).toLocaleString()}`}
      />
      <TeamMemberForm member={member} />
    </div>
  );
}
