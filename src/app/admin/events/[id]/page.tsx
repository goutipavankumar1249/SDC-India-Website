import { notFound } from "next/navigation";
import { requireAdmin } from "@/admin/lib/auth";
import { adminGetEventById } from "@/admin/lib/data/events";
import PageHeader, { BackLink } from "@/admin/components/PageHeader";
import EventForm from "@/admin/components/EventForm";

export const metadata = { title: "Edit event · Admin" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const event = await adminGetEventById(id);
  if (!event) return notFound();

  return (
    <div className="p-8 max-w-[1280px]">
      <BackLink href="/admin/events" label="All events" />
      <PageHeader
        label="Edit event"
        title={event.title}
        description={`ID ${event.id} · last updated ${new Date(event.updated_at).toLocaleString()}`}
      />
      <EventForm event={event} />
    </div>
  );
}
