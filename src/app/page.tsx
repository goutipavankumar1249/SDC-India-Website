import Link from "next/link";
import Image from "next/image";
import { publicListEvents } from "@/admin/lib/data/events";
import { publicListHighlights } from "@/admin/lib/data/highlights";
import { publicListTeam } from "@/admin/lib/data/team";
import { publicListPartners } from "@/admin/lib/data/partners";
import { mapRowsToEvents } from "@/lib/mappers/events";
import { mapRowToHighlight } from "@/lib/mappers/highlights";
import { mapRowToTeamMember } from "@/lib/mappers/team";
import HeroSlideshow from "@/components/HeroSlideshow";
import EventCard from "@/components/cards/EventCard";
import TeamCard from "@/components/cards/TeamCard";
import HighlightCard from "@/components/cards/HighlightCard";
import PartnerCard from "@/components/cards/PartnerCard";

export const revalidate = 60;

const HERO_STATS = [
  { value: "2500+", label: "MEMBERS" },
  { value: "50+",   label: "EVENTS HOSTED" },
  { value: "120+",  label: "WORKSHOPS" },
  { value: "10+",   label: "PARTNERS" },
  { value: "2022",  label: "SINCE" },
];

export default async function Home() {
  const [upcomingRows, pastRows, highlightRows, teamRows, partnerRows] = await Promise.all([
    publicListEvents({ filter: "upcoming" }),
    publicListEvents({ filter: "past" }),
    publicListHighlights(),
    publicListTeam(),
    publicListPartners(),
  ]);

  const upcoming  = upcomingRows[0];                         // raw row (we need row.id for RegisterButton)
  const recentPast = mapRowsToEvents(pastRows.slice(0, 3));
  const homeHighlights = highlightRows.slice(0, 3).map(mapRowToHighlight);

  // Team preview: founder + first 3 contributors
  const teamMembers = teamRows.map(mapRowToTeamMember);
  const founder = teamMembers.find((m) => m.section === "Founder");
  const core    = teamMembers.filter((m) => m.section !== "Founder").slice(0, 3);
  const HOME_TEAM_PREVIEW = [founder, ...core].filter((m): m is NonNullable<typeof founder> => Boolean(m));

  return (
    <main className="overflow-x-hidden">
      {/* ───── HERO ───── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 text-center overflow-hidden">
        <HeroSlideshow />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs"
            style={{
              border: "1px solid rgba(232,67,147,.35)",
              background: "rgba(232,67,147,.08)",
              color: "var(--a1)",
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            }}
          >
            <span className="pulse" />
            ✦ HACK FOR HYDERABAD · Registrations Opening Soon
          </div>

          <h1
            className="font-extrabold leading-[1] mb-6"
            style={{
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              fontSize: "clamp(3rem, 8vw, 6.5rem)",
              letterSpacing: "-.03em",
            }}
          >
            Build.<br />
            <span className="gtext">Create.</span><br />
            Inspire.
          </h1>

          <p className="max-w-xl mx-auto text-base leading-[1.78] mb-9" style={{ color: "var(--sub)" }}>
            SDC INDIA is a student-led developer community founded in 2022 at SNIST.
            We bridge the gap between academic learning and industry through hackathons, workshops, and real-world projects.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/host" className="btn-grad">Host an Event With Us</Link>
            <Link href="/events" className="btn-outline">Explore Events</Link>
          </div>

          <div className="flex gap-10 justify-center flex-wrap mt-14">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="gtext font-extrabold text-[2.1rem] leading-none"
                  style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
                >
                  {s.value}
                </div>
                <div className="text-[.67rem] tracking-widest mt-1.5" style={{ color: "var(--muted)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6">

        {/* ───── ABOUT ───── */}
        <SectionDivider />
        <SectionHeader
          label="// ABOUT US"
          title={<>A community built<br/>by students, for students</>}
          sub="Founded in 2022 at SNIST by Chandrashekhar M, SDC has grown from a campus initiative into SDC INDIA — a nationwide student developer movement."
          cta={{ label: "Learn more →", href: "/about" }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1.1rem] mb-10">
          {[
            { icon: "🎯", title: "Our Mission",     desc: "Bridge the gap between academic learning and industry by helping students learn, build, and grow together." },
            { icon: "👁",  title: "Our Vision",      desc: "Become India's largest and most impactful student developer community, fostering innovation and continuous learning." },
            { icon: "🏆", title: "Real Projects",   desc: "Hackathons, bootcamps, and projects that turn into portfolios, internships, and full-time roles." },
            { icon: "🌐", title: "National Network",desc: "From SNIST to SDC INDIA — collaborating with Microsoft, GDSC, PyCon, Hack This Fall and 6+ more." },
          ].map((card) => (
            <div key={card.title} className="rounded-[14px] p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="text-[1.8rem] mb-3">{card.icon}</div>
              <div className="font-bold text-[.93rem] mb-1.5" style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>{card.title}</div>
              <p className="text-[.8rem] leading-[1.6]" style={{ color: "var(--sub)" }}>{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[16px] p-8 mt-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-extrabold text-xl mb-3" style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>Founding Story</h3>
          <p className="text-[.92rem] leading-[1.85]" style={{ color: "var(--sub)" }}>
            The <strong style={{ color: "var(--text)" }}>Student Developers Community (SDC)</strong> was established in <strong style={{ color: "var(--text)" }}>2022 at SNIST</strong>, founded by <strong style={{ color: "var(--text)" }}>Mr. Chandrashekhar M</strong> — a SNIST alumnus from the 2021–2024 batch.
          </p>
          <p className="text-[.92rem] leading-[1.85] mt-3" style={{ color: "var(--sub)" }}>
            His vision was simple: create a space where students grow technically through collaboration and hands-on learning. Today, SDC unites over <strong style={{ color: "var(--text)" }}>2500 members</strong> with a growing national footprint under <span className="gtext font-bold">SDC INDIA</span>.
          </p>
        </div>

        {/* Community Impact stats */}
        <div className="mt-10">
          <div className="sec-label mb-2">// COMMUNITY IMPACT</div>
          <h3 className="sec-title mb-6" style={{ fontSize: "1.5rem" }}>By the numbers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "50+",   label: "EVENTS HOSTED" },
              { value: "5000+", label: "STUDENTS REACHED" },
              { value: "120+",  label: "WORKSHOPS" },
              { value: "2500+", label: "COMMUNITY MEMBERS" },
            ].map((s) => (
              <div key={s.label} className="rounded-[14px] p-6 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="gtext font-extrabold text-[2.4rem]" style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>{s.value}</div>
                <div className="text-[.72rem] mt-1.5" style={{ color: "var(--muted)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values + Gallery */}
        <div className="mt-12">
          <div className="sec-label mb-2">// CORE VALUES</div>
          <h3 className="sec-title mb-6" style={{ fontSize: "1.5rem" }}>What we believe in</h3>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <ul className="space-y-3 list-none p-0">
                {[
                  "Open and inclusive learning environment",
                  "Real-world, hands-on exposure beyond classroom theory",
                  "Peer collaboration over competition",
                  "Industry-aligned skill building with practical mentorship",
                  "National-level event partnerships and exposure",
                  "Community-driven growth and student leadership",
                ].map((v) => (
                  <li key={v} className="flex gap-3 text-[.9rem] leading-[1.65]" style={{ color: "var(--sub)" }}>
                    <span className="shrink-0" style={{ color: "var(--a1)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>→</span>
                    {v}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-7">
                {["Web Development", "AI / ML", "UI / UX Design", "Blockchain / Web3", "Backend Dev", "Data Science", "Hackathons", "Open Source"].map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full text-[.7rem]" style={{ border: "1px solid var(--border2)", color: "var(--sub)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[.65rem] mb-3 tracking-widest" style={{ color: "var(--sub)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>📸 COMMUNITY GALLERY</div>
              <div className="grid grid-cols-3 gap-2.5">
                <GalleryTile src="/assets/blog/event.jpeg"       alt="SDC Event"    span="col-span-2 aspect-[2/1]" />
                <GalleryTile src="/assets/blog/snist.jpeg"       alt="SNIST Campus" span="aspect-square" />
                <GalleryTile src="/assets/blog/community-1.jpeg" alt="Community"    span="aspect-square" />
                <GalleryTile src="/assets/blog/community-2.jpeg" alt="Members"      span="aspect-square" />
                <GalleryTile src="/assets/blog/community-3.jpeg" alt="Team"         span="aspect-square" />
              </div>
              <p className="text-[.67rem] mt-2" style={{ color: "var(--muted)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
                Moments from SDC events · 2022 — 2025
              </p>
            </div>
          </div>
        </div>

        {/* ───── UPCOMING ───── */}
        <SectionDivider />
        <SectionHeader
          label="// UPCOMING"
          title="What's coming next"
          cta={{ label: "See all events →", href: "/events" }}
        />

        {upcoming && (
          <div
            className="rounded-[18px] p-8 flex justify-between items-center gap-8 flex-wrap mb-9"
            style={{
              background: "linear-gradient(135deg, rgba(232,67,147,.07), rgba(168,85,247,.07))",
              border: "1px solid rgba(232,67,147,.2)",
            }}
          >
            <div>
              <div
                className="inline-block px-3 py-1 rounded-full text-[.67rem] mb-2.5"
                style={{ background: "rgba(34,197,94,.1)", color: "#22c55e", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
              >
                🟢 OPENING SOON
              </div>
              <div className="font-extrabold text-[1.7rem]" style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
                {upcoming.title} 🏆
              </div>
              <p className="text-[.86rem] mt-1.5 max-w-md" style={{ color: "var(--sub)" }}>{upcoming.description}</p>
              <div className="flex gap-4 flex-wrap mt-3 text-[.73rem]" style={{ color: "var(--muted)" }}>
                <span>📅 {upcoming.event_date ?? "Date TBA"}</span>
                <span>📍 {upcoming.location ?? "TBA"}</span>
                <span>👥 {upcoming.seats ?? 300} Seats</span>
                <span>🏆 National Level</span>
              </div>
            </div>
            <div className="text-center">
              <div
                className="inline-block gtext font-extrabold text-[1.2rem] px-4 py-1.5 rounded-lg mb-3"
                style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", border: "1px solid rgba(232,67,147,.25)", letterSpacing: ".05em" }}
              >
                DATE · TBA
              </div>
              <div className="text-[.7rem] mb-3" style={{ color: "var(--muted)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
                REGISTRATIONS OPENING SOON
              </div>
              <Link href={`/events/${upcoming.slug ?? upcoming.id}`} className="btn-grad" style={{ fontSize: ".8rem", padding: ".58rem 1.35rem" }}>
                View Details →
              </Link>
            </div>
          </div>
        )}

        {/* ───── PAST EVENTS ───── */}
        <SectionDivider />
        <SectionHeader
          label="// PAST EVENTS"
          title="What we've built together"
          cta={{ label: "See all past events →", href: "/events" }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1.3rem]">
          {recentPast.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} className="block">
              <EventCard event={e} variant="past" />
            </Link>
          ))}
        </div>

        {/* ───── HIGHLIGHTS ───── */}
        <SectionDivider />
        <SectionHeader
          label="// EVENT HIGHLIGHTS"
          title="Stories from our hackathons"
          cta={{ label: "All highlights →", href: "/highlights" }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1.3rem]">
          {homeHighlights.map((h) => (
            <Link key={h.id} href={`/highlights#${h.id}`} className="block">
              <HighlightCard highlight={h} />
            </Link>
          ))}
        </div>

        {/* ───── TEAM PREVIEW ───── */}
        <SectionDivider />
        <SectionHeader
          label="// THE TEAM"
          title="The people behind SDC"
          cta={{ label: "Meet the full team →", href: "/team" }}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1.2rem]">
          {HOME_TEAM_PREVIEW.map((m) => (
            <Link key={m.id} href={`/team#${m.id}`} className="block">
              <TeamCard member={m} />
            </Link>
          ))}
        </div>

        {/* ───── PARTNERS ───── */}
        <SectionDivider />
        <SectionHeader
          label="// PARTNERS & COLLABORATORS"
          title="We partner with"
          sub="National communities and industry organizations that have hosted, sponsored, or partnered with SDC events."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {partnerRows.map((p, i) => (
            <PartnerCard key={p.id} src={p.logo_url} alt={p.name} index={i} />
          ))}
        </div>

        {/* ───── CTA ───── */}
        <SectionDivider />
        <div
          className="rounded-[18px] p-10 md:p-14 text-center mb-20"
          style={{
            background: "linear-gradient(135deg, rgba(232,67,147,.07), rgba(168,85,247,.07))",
            border: "1px solid rgba(232,67,147,.2)",
          }}
        >
          <div className="text-[.67rem] tracking-widest mb-2" style={{ color: "var(--a1)", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
            // JOIN US
          </div>
          <h3 className="font-extrabold text-[2rem] md:text-[2.5rem] mb-3" style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
            Ready to <span className="gtext">build something</span> together?
          </h3>
          <p className="max-w-xl mx-auto text-base mb-6" style={{ color: "var(--sub)" }}>
            Host an event at your college, join an upcoming hackathon, or just say hi. We&apos;d love to hear from you.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/host" className="btn-grad">Host an Event</Link>
            <Link href="/contact" className="btn-outline">Get in Touch</Link>
          </div>
        </div>

      </div>
    </main>
  );
}

/* ── helpers ── */
function SectionDivider() {
  return <div className="hdivider" />;
}

function SectionHeader({
  label, title, sub, cta,
}: {
  label: string;
  title: React.ReactNode;
  sub?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="flex justify-between items-end mb-9 flex-wrap gap-4">
      <div>
        <div className="sec-label mb-2">{label}</div>
        <h2 className="sec-title">{title}</h2>
        {sub && <p className="sec-sub">{sub}</p>}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="text-[.78rem] px-3.5 py-1.5 rounded-md transition-colors hover:text-white"
          style={{ color: "var(--sub)", border: "1px solid var(--border)" }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}


function GalleryTile({ src, alt, span }: { src: string; alt: string; span: string }) {
  return (
    <div className={`relative ${span} overflow-hidden rounded-[10px]`} style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <Image src={src} alt={alt} fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="(max-width: 768px) 33vw, 18vw" />
    </div>
  );
}
