import { getStats } from "@/lib/stats";
import { HomePageClient } from "@/components/HomePageClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const stats = await getStats();
  return <HomePageClient initialStats={stats} />;
}