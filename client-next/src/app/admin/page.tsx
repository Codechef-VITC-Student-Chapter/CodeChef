import { client } from "@/lib/sanityClient";
import AdminDashboardClient from "@/components/Admin/AdminDashboardClient";
import LogoutButton from "@/components/Admin/LogoutButton";

export const dynamic = "force-dynamic";

export interface Member {
  _id: string;
  name: string;
  codechefUsername: string;
  rating: number;
  active: boolean;
}

async function getMembers(): Promise<Member[]> {
  return client.fetch(
    `*[_type == "users"] | order(name asc){ _id, name, codechefUsername, rating, "active": active != false }`,
    {},
    { useCdn: false }
  );
}

async function getCurrentLeaderboardIds(): Promise<string[]> {
  const doc = await client.fetch(
    `*[_type == "currentLeaderboard" && _id == "currentLeaderboard"][0]{ "ids": top10[]._ref }`,
    {},
    { useCdn: false }
  );
  return doc?.ids || [];
}

export default async function AdminPage() {
  const [members, leaderboardIds] = await Promise.all([getMembers(), getCurrentLeaderboardIds()]);

  return (
    <main className="min-h-screen w-full bg-white">
      <header className="border-b-2 border-black px-6 py-4 flex items-center justify-between bg-white">
        <h1
          className="text-2xl text-black tracking-widest uppercase"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          CodeChef Admin
        </h1>
        <div className="flex items-center gap-4">
          <a
            href="/admin/recruitment"
            className="text-sm font-bold text-[#5878AF] border-2 border-black rounded-[8px] px-4 py-1.5 uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#ECE9C7] transition-colors"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
          >
            Recruitment →
          </a>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <AdminDashboardClient members={members} initialLeaderboardIds={leaderboardIds} />
      </div>
    </main>
  );
}
