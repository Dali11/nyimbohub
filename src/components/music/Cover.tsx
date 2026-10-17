"use client";

import { Music2 } from "lucide-react";
import type { Track } from "@/lib/types";

// Next 16 image docs (node_modules/next/dist/docs/01-app/01-getting-started/12-images.md):
// Remote images need `remotePatterns` listed in next.config.ts, and signed S3 URLs
// would need `unoptimized`, which disables the very optimisation <Image> is for.
// A plain <img> with loading="lazy" + explicit dimensions is simplest, has no
// external config, and gives the same visual result for signed, expiring URLs.

type CoverProps = {
  track: Track;
  variant?: "sm" | "md" | "lg";
  rounded?: boolean;
  className?: string;
};

// Variant -> pixel size (min 44px satisfies the mobile touch-target rule).
const sizeByVariant: Record<string, number> = {
  sm: 40,
  md: 48,
  lg: 112,
};

export default function Cover({
  track,
  variant = "md",
  rounded = true,
  className,
}: CoverProps) {
  const size = sizeByVariant[variant];
  const roundedClass = rounded ? "rounded-lg" : "rounded-none";

  return (
    <div
      className={`relative flex shrink-0 overflow-hidden shadow-lg ${roundedClass} ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt={track.title}
          loading="lazy"
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="grid h-full w-full place-items-center"
          style={{ background: `linear-gradient(135deg, ${track.gradient})` }}
        >
          <div className="flex flex-col items-center gap-1">
            <Music2 className="size-4 opacity-70" />
            <span className="text-sm font-black text-white/90">
              {track.title.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
