import { requireAdmin } from "@/admin/lib/auth";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import PartnerForm from "@/admin/components/PartnerForm";

export const metadata = { title: "New partner · Admin" };

export default async function NewPartnerPage() {
  await requireAdmin();
  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/partners" label="All partners" />
      <PageHeader label="New partner" title="Add partner" />
      <PartnerForm />
    </div>
  );
}
