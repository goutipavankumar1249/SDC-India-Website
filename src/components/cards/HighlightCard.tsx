"use client";

import { motion } from "framer-motion";
import type { Highlight } from "@/data/highlights";

export default function HighlightCard({
  highlight,
  onClick,
}: {
  highlight: Highlight;
  onClick?: () => void;
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
        rest: { y: 0, boxShadow: "0 0 0 1px rgba(30,30,30,.6), 0 6px 18px rgba(0,0,0,.22)" },
        hover: { y: -7, boxShadow: "0 0 0 1px rgba(168,85,247,.4), 0 28px 54px rgba(0,0,0,.46)" },
      }}
      className="relative isolate overflow-hidden cursor-pointer p-[1.7rem] rounded-[15px]"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* Gradient bar that slides in on hover */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[3px] z-[2]"
        style={{ background: "var(--grad)", transformOrigin: "left center" }}
        variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Trophy/icon */}
      <motion.div
        className="text-[1.8rem] mb-[.6rem] inline-block"
        style={{ lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(232,67,147,.25))" }}
        animate={{ scale: [1, 1.06, 1], rotate: [0, -3, 0] }}
        transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
        variants={{
          rest: { scale: 1, rotate: 0 },
          hover: { scale: 1.18, rotate: -8 },
        }}
      >
        {highlight.positionIcon}
      </motion.div>

      <p
        className="text-[.86rem] italic leading-[1.75] mb-[1.3rem]"
        style={{ color: "var(--sub)" }}
      >
        {highlight.description}
      </p>

      <div className="flex items-center gap-[.8rem]">
        <motion.div
          className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white font-extrabold text-[.9rem] flex-shrink-0"
          style={{ background: highlight.gradient, fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
          variants={{
            rest: { scale: 1, rotate: 0, boxShadow: "0 0 0 rgba(232,67,147,0)" },
            hover: { scale: 1.12, rotate: 6, boxShadow: "0 8px 22px rgba(232,67,147,.35)" },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          {highlight.initials}
        </motion.div>
        <div>
          <div
            className="font-bold text-[.87rem] group-hover:gtext transition-colors"
            style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", color: "var(--text)" }}
          >
            {highlight.team}
          </div>
          <div className="text-[.7rem]" style={{ color: "var(--muted)" }}>
            {highlight.event}
          </div>
          <div className="text-[.63rem] font-mono mt-[.12rem]" style={{ color: "var(--a3)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
            {highlight.position} place · {highlight.eventDate}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
