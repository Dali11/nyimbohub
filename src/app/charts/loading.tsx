import Skeleton from "./../../components/ui/Skeleton";

export default function TrackListLoading() {
  return (
    <div className="space-y-1">
      {[0, 1, 2, 3, 4, 5].map((i) => (
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
        </div>
      ))}
    </div>
  );
}
