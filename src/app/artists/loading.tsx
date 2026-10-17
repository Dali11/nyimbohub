import Skeleton from "./../../components/ui/Skeleton";

export default function ArtistsLoading() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  );
}
