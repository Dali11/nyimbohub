"use client";

import { useState } from "react";
import { videos, type VideoTag } from "@/lib/mock-data";
import VideoCard from "./VideoCard";

type Filter = "all" | VideoTag;

const chips: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "latest", label: "Latest" },
  { key: "trending", label: "Trending" },
  { key: "featured", label: "Featured" },
];

export default function VideoBrowser() {
  const [filter, setFilter] = useState<Filter>("all");

  const list = filter === "all" ? videos : videos.filter((v) => v.tags.includes(filter));
  const [first, ...rest] = list;

  return (
    <>
      <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`shrink-0 rounded-full px-5 py-1.5 text-sm transition-colors ${
              c.key === filter
                ? "bg-brand font-semibold text-white"
                : "border border-line bg-surface text-muted hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {first ? (
        <>
          <VideoCard video={first} featured />
          {rest.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="py-10 text-center text-sm text-muted">No videos here yet.</p>
      )}
    </>
  );
}
