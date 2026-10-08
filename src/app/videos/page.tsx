import VideoBrowser from "@/components/videos/VideoBrowser";

export const metadata = { title: "Music Videos — NyimboHub" };

export default function VideosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-5 text-3xl font-bold">Music Videos</h1>
      <VideoBrowser />
    </div>
  );
}
