"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export default function ArtistActions({ name }: { name: string }) {
  const [following, setFollowing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} on NyimboHub`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // user cancelled the share sheet, nothing to do
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setFollowing((f) => !f)}
        className={`rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${
          following
            ? "border border-line bg-surface text-white"
            : "bg-brand hover:bg-brand-dark"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
      <button
        onClick={share}
        className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface"
      >
        {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
        {copied ? "Link copied" : "Share"}
      </button>
    </div>
  );
}
