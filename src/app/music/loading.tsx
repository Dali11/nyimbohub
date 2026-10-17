import Skeleton from "./../../components/ui/Skeleton";

export default function MusicLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 flex-shrink-0 rounded-full px-4 py-2.5" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="mt-1 h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full px-3" />
      </div>
      <div className="mb-2 grid grid-cols-[44px_minmax(0,1fr)_44px] gap-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted/60 sm:grid-cols-[44px_minmax(0,1fr)_120px_80px_90px] sm:gap-4 sm:px-4">
        <div>#</div>
        <div>Track</div>
        <div className="hidden text-right sm:block">Plays</div>
        <div className="hidden text-right sm:block">Time</div>
        <div />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="grid min-h-[82px] grid-cols-[30px_minmax(0,1fr)_44px] sm:grid-cols-[30px_minmax(0,1fr)_44px_120px_80px_90px] gap-3 px-3 sm:px-4"
        >
          <Skeleton className="h-5 w-6 rounded" />
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="min-w-0">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="mt-1 h-3 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <div />
        </div>
      ))}
    </div>
  );
}
