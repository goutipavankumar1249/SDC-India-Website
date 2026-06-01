import { publicListTeam } from "@/admin/lib/data/team";
import { mapRowToTeamMember } from "@/lib/mappers/team";
import { type TeamMember } from "@/data/team";
import TeamCard from "@/components/cards/TeamCard";

export const revalidate = 60;

export default async function TeamPage() {
  const rows = await publicListTeam();
  const members = rows.map(mapRowToTeamMember);
  const founder = members.filter((m) => m.section === "Founder");
  const core    = members.filter((m) => m.section === "Core" || m.section === "Tech" || m.section === "Board");
  const alumni  = members.filter((m) => m.section === "Alumni");

  return (
    <main className="pt-32 pb-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="sec-label mb-2">// THE PEOPLE BEHIND SDC</div>
        <h1 className="sec-title">Meet the team</h1>
        <p className="sec-sub mb-12">
          The founder and core contributors driving SDC INDIA forward. Click any member to learn more.
        </p>

        {founder.length > 0 && <TeamGroup title="Founder"           members={founder} />}
        {core.length    > 0 && <TeamGroup title="Core Contributors" members={core}    />}
        {alumni.length  > 0 && <TeamGroup title="Alumni"            members={alumni}  />}
      </div>
    </main>
  );
}

function TeamGroup({ title, members }: { title: string; members: TeamMember[] }) {
  return (
    <section className="mb-10">
      <h2
        className="font-extrabold text-base mb-5 flex items-center gap-2.5"
        style={{ color: "var(--text)", letterSpacing: "-.01em" }}
      >
        <span className="inline-block w-[18px] h-[2px] rounded" style={{ background: "var(--grad)" }} />
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1.2rem]">
        {members.map((m) => (
          <div key={m.id} id={m.id}>
            <TeamCard member={m} />
          </div>
        ))}
      </div>
    </section>
  );
}
