import Sidebar from "@/components/layout/Sidebar";
import LikedTracks from "./LikedTracks";

export default function LikedSongsPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-none items-start gap-6 px-4 sm:px-6 lg:px-8">
      <Sidebar />
      <section className="min-w-0 flex-1 space-y-6 py-8 lg:py-10">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-brand/15 text-brand">
            <span className="text-2xl">♥</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Your library</p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Favourites</h1>
            <p className="mt-1 text-sm text-muted">The songs you want to come back to.</p>
          </div>
        </div>
        <LikedTracks />
      </section>
    </div>
  );
}
