import Skeleton from "./../../components/ui/Skeleton";

export default function VideosLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32 rounded-full" />
      <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
