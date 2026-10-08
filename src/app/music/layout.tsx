import Sidebar from "@/components/layout/Sidebar";

export default function MusicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 sm:px-6">
      <Sidebar />
      <div className="min-w-0 flex-1 py-6">{children}</div>
    </div>
  );
}
