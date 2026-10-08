import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-surface">
      {/* Replace this gradient with <Image src="/images/hero.jpg" fill className="object-cover" priority /> */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(255,45,143,0.45),transparent_55%),radial-gradient(ellipse_at_95%_80%,rgba(60,90,255,0.45),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent" />

      <div className="relative px-6 py-14 sm:px-12 sm:py-20 lg:max-w-2xl">
        <p className="mb-5 text-xs font-medium tracking-[0.3em] text-muted">
          MALAWI&apos;S MUSIC PLATFORM
        </p>
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Discover
          <br />
          New Sounds
          <br />
          <span className="text-brand">Support Local Talent</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-white/80">
          Stream, download and watch music from Malawi&apos;s upcoming artists.
          Real music. Real stories. One hub.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/music"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-semibold hover:bg-brand-dark"
          >
            Explore Music <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 rounded-lg border border-brand px-6 py-3 font-semibold hover:bg-brand/10"
          >
            <Play className="size-4 fill-white" /> Watch Videos
          </Link>
        </div>
      </div>
    </section>
  );
}
