import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import TrendingNow from "@/components/home/TrendingNow";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Hero />
      <QuickLinks />
      <TrendingNow />
    </div>
  );
}
