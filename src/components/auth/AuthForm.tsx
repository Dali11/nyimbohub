"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const isSignUp = mode === "sign-up";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password, callbackURL: "/" })
        : await authClient.signIn.email({ email: email.trim(), password, callbackURL: "/" });
      if (result.error) {
        setError(result.error.message ?? "Authentication failed. Please try again.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("We couldn’t connect. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
      <div className="mb-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand">NyimboHub</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">{isSignUp ? "Join the sound" : "Welcome back"}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{isSignUp ? "Create your listener account and save the music you love." : "Sign in to pick up where your music journey left off."}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && <label className="block text-sm font-medium text-white">Your name<input autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none transition focus:border-brand" /></label>}
        <label className="block text-sm font-medium text-white">Email address<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none transition focus:border-brand" /></label>
        <label className="block text-sm font-medium text-white">Password<input type="password" autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none transition focus:border-brand" /><span className="mt-1 block text-xs text-muted">Use at least 8 characters.</span></label>
        {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">{isSignUp ? "Already have an account? " : "New to NyimboHub? "}<Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-semibold text-brand hover:underline">{isSignUp ? "Sign in" : "Create an account"}</Link></p>
    </section>
  );
}
