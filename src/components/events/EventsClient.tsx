"use client";

import { useState } from "react";
import Link from "next/link";
import EventCard from "@/components/cards/EventCard";
import RegisterButton from "@/components/events/RegisterButton";
import type { Event } from "@/types/events";

/**
 * Each upcoming event optionally carries its raw row info so we can
 * show a Register button when the admin has marked it as registration_open.
 */
export type UpcomingEventForClient = Event & {
  rowId?: string;            // UUID — needed by RegisterButton (FK to events.id)
  registrationOpen?: boolean;
};

export default function EventsClient({
  upcoming,
  past,
}: {
  upcoming: UpcomingEventForClient[];
  past: Event[];
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 mb-8" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["upcoming", "past"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-5 py-2.5 text-[.8rem] font-semibold transition-colors"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === id ? "2px solid var(--a1)" : "2px solid transparent",
              color: tab === id ? "var(--text)" : "var(--sub)",
              cursor: "pointer",
            }}
          >
            {id === "upcoming" ? "🟢 Upcoming Events" : "🗂 Past Events"}
          </button>
        ))}
      </div>

      {tab === "upcoming" && (
        <>
          {upcoming.length === 0 && (
            <p className="text-sm text-center p-6 rounded-xl" style={{ color: "var(--muted)", border: "1px dashed var(--border)" }}>
              No upcoming events yet. Subscribe via Instagram{" "}
              <a href="https://instagram.com/sdc.snist" target="_blank" rel="noopener" className="underline" style={{ color: "var(--a1)" }}>@sdc.snist</a>
              {" "}for updates.
            </p>
          )}
          {upcoming.map((e) => (
            <div
              key={e.id}
              className="rounded-[18px] p-8 flex justify-between items-center gap-8 flex-wrap mb-6"
              style={{
                background: "linear-gradient(135deg, rgba(232,67,147,.07), rgba(168,85,247,.07))",
                border: "1px solid rgba(232,67,147,.2)",
              }}
            >
              <div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-[.67rem] mb-2.5"
                  style={{ background: "rgba(34,197,94,.1)", color: "#22c55e" }}
                >
                  🟢 OPENING SOON
                </div>
                <div className="font-extrabold text-[1.7rem]">{e.title} 🏆</div>
                <p className="text-[.86rem] mt-1.5 max-w-md" style={{ color: "var(--sub)" }}>{e.description}</p>
                <div className="flex gap-4 flex-wrap mt-3 text-[.73rem]" style={{ color: "var(--muted)" }}>
                  <span>📅 {e.date}</span>
                  <span>📍 {e.location}</span>
                  <span>👥 {e.seats ?? e.attendees} Seats</span>
                </div>
              </div>
              <div className="text-center">
                <div
                  className="inline-block gtext font-extrabold text-[1.2rem] px-4 py-1.5 rounded-lg mb-3"
                  style={{ border: "1px solid rgba(232,67,147,.25)", letterSpacing: ".05em" }}
                >
                  DATE · TBA
                </div>
                <div className="text-[.7rem] mb-3" style={{ color: "var(--muted)" }}>
                  {e.registrationOpen ? "REGISTRATIONS OPEN" : "REGISTRATIONS OPENING SOON"}
                </div>
                <div className="flex gap-2 justify-center flex-wrap">
                  {e.registrationOpen && e.rowId && (
                    <RegisterButton eventId={e.rowId} eventTitle={e.title} />
                  )}
                  <Link href={`/events/${e.id}`} className={e.registrationOpen ? "btn-outline" : "btn-grad"} style={{ fontSize: ".8rem", padding: ".58rem 1.35rem" }}>
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "past" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {past.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} className="block">
              <EventCard event={e} variant="past" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
