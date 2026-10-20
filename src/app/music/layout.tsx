import Sidebar from "@/components/layout/Sidebar";

export default function MusicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-none items-start gap-6 px-4 sm:px-6 lg:px-8">
      <Sidebar />
      <div className="min-w-0 flex-1 py-0">{children}</div>
    </div>
  );
}
