import { requireAdmin } from "@/admin/lib/auth";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import EventForm from "@/admin/components/EventForm";

export const metadata = { title: "New event · Admin" };

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/events" label="All events" />
      <PageHeader
        label="New event"
        title="Create event"
        description="Fill in the details. You can save as a draft and publish later."
      />
      <EventForm />
    </div>
  );
}
