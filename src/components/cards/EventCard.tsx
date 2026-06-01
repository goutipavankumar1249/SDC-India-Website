"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Event } from "@/types/events";

export default function EventCard({
  event,
  onClick,
  variant = "past",
}: {
  event: Event;
  onClick?: () => void;
  variant?: "upcoming" | "past";
}) {
  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      variants={{
        rest: {
          y: 0,
          boxShadow:
            "0 0 0 1px rgba(30,30,30,.6), 0 6px 18px rgba(0,0,0,.25)",
        },
        hover: {
          y: -6,
          boxShadow:
            "0 0 0 1px rgba(232,67,147,.45), 0 28px 54px rgba(0,0,0,.45)",
        },
      }}
      className="group relative isolate flex flex-col overflow-hidden rounded-[15px] cursor-pointer"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* Image */}
      <div className="relative h-[155px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Image
            src={event.image || "/assets/events/sdc-india-logo.jpeg"}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </motion.div>

        {/* Bottom gradient for text legibility */}
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background:
              "linear-gradient(to top, rgba(20,20,20,.55) 0%, rgba(20,20,20,.08) 45%, transparent 70%)",
          }}
        />

        {/* Shine sweep on hover */}
        <motion.div
          className="pointer-events-none absolute top-0 h-full z-[3]"
          style={{
            width: "60%",
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.16) 50%, transparent 70%)",
          }}
          variants={{ rest: { left: "-120%" }, hover: { left: "160%" } }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />

        {/* Hover overlay text */}
        <motion.div
          className="absolute inset-0 z-[4] flex items-center justify-center text-white font-mono text-xs"
          style={{ background: "rgba(0,0,0,.52)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
          variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
          transition={{ duration: 0.2 }}
        >
          👁 View Details
        </motion.div>
      </div>

      {/* Body */}
      <div className="p-[1.15rem] flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-[.3rem]">
          <span
            className="text-[.67rem] font-mono"
            style={{ color: variant === "upcoming" ? "var(--a2)" : "var(--muted)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
          >
            {event.date}
          </span>
          <span
            className="px-[.58rem] py-[.18rem] rounded-full text-[.6rem] font-mono uppercase tracking-wider"
            style={{
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              background: variant === "upcoming"
                ? "rgba(34,197,94,.12)"
                : "rgba(136,136,136,.07)",
              color: variant === "upcoming" ? "#22c55e" : "var(--sub)",
            }}
          >
            {variant === "upcoming" ? "Upcoming" : "Past"}
          </span>
        </div>
        <h3
          className="font-bold text-[.95rem] mb-1 leading-tight transition-colors group-hover:[color:var(--a1)]"
          style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", color: "var(--text)" }}
        >
          {event.title}
        </h3>
        <p className="text-[.78rem] leading-[1.55] mb-3 line-clamp-2" style={{ color: "var(--sub)" }}>
          {event.description}
        </p>
        <div className="flex gap-[.85rem] flex-wrap mt-auto text-[.67rem]" style={{ color: "var(--muted)" }}>
          <span>📍 {event.location.split(",")[0]}</span>
          <span>⏱ {event.duration}</span>
          {event.attendees > 0 && <span>👥 {event.attendees}</span>}
        </div>
      </div>
    </motion.div>
  );
}
