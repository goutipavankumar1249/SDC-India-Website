import { publicListEvents } from "@/admin/lib/data/events";
import { mapRowsToEvents, mapRowToEvent } from "@/lib/mappers/events";
import EventsClient, { type UpcomingEventForClient } from "@/components/events/EventsClient";

export const revalidate = 60;

export default async function EventsPage() {
  const [upcomingRows, pastRows] = await Promise.all([
    publicListEvents({ filter: "upcoming" }),
    publicListEvents({ filter: "past" }),
  ]);

  const upcoming: UpcomingEventForClient[] = upcomingRows.map((row) => ({
    ...mapRowToEvent(row),
    rowId: row.id,
    registrationOpen: row.registration_open,
  }));
  const past = mapRowsToEvents(pastRows);

  return (
    <main className="pt-32 pb-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="sec-label mb-2">// EVENTS</div>
        <h1 className="sec-title">Where the magic happens</h1>
        <p className="sec-sub mb-8">
          From flagship hackathons like HASH IT OUT and UXplosion to workshops at Microsoft and Swecha — every SDC event is a chance to learn, build, and connect.
        </p>

        <EventsClient upcoming={upcoming} past={past} />
      </div>
    </main>
  );
}
