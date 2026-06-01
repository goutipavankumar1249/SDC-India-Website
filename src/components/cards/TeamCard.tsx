"use client";

import { motion } from "framer-motion";
import type { TeamMember } from "@/data/team";

export default function TeamCard({
  member,
  onClick,
}: {
  member: TeamMember;
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
        rest: {
          y: 0,
          boxShadow: "0 0 0 1px rgba(30,30,30,.6), 0 4px 14px rgba(0,0,0,.18)",
        },
        hover: {
          y: -6,
          boxShadow: "0 0 0 1px rgba(168,85,247,.4), 0 24px 50px rgba(0,0,0,.4)",
        },
      }}
      className="text-center cursor-pointer rounded-[15px] p-[1.6rem_1.3rem]"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <motion.div
        className="w-16 h-16 rounded-full mx-auto mb-[.85rem] flex items-center justify-center text-white font-extrabold text-[1.2rem]"
        style={{ background: member.gradient, fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
        variants={{
          rest: { scale: 1, rotate: 0 },
          hover: { scale: 1.12, rotate: 6 },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      >
        {member.initials}
      </motion.div>
      <h4
        className="font-bold text-[.9rem] mb-1"
        style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", color: "var(--text)" }}
      >
        {member.name}
      </h4>
      <p className="text-[.72rem]" style={{ color: "var(--sub)" }}>{member.role}</p>
      <motion.p
        className="text-[.62rem] font-mono mt-[.55rem]"
        style={{ color: "var(--muted)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.2 }}
      >
        click to know more →
      </motion.p>
    </motion.div>
  );
}
