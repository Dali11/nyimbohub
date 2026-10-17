import Skeleton from "./../components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="mt-5 h-4 w-40 max-w-full rounded" />
      <div className="mt-2 h-3 w-24 max-w-full rounded" />
    </div>
  );
}
