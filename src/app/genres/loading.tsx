import Skeleton from "./../../components/ui/Skeleton";

export default function GenresLoading() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}
