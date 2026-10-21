"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const isSignUp = mode === "sign-up";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (isSignUp && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
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
        <label className="block text-sm font-medium text-white">Password<div className="relative mt-2"><input type={showPassword ? "text" : "password"} autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line bg-bg px-4 py-3 pr-12 text-white outline-none transition focus:border-brand" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted transition hover:text-white"><span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></div>{isSignUp && <span className="mt-1 block text-xs text-muted">Use at least 8 characters.</span>}</label>
        {isSignUp && <label className="block text-sm font-medium text-white">Confirm password<div className="relative mt-2"><input type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-line bg-bg px-4 py-3 pr-12 text-white outline-none transition focus:border-brand" /> <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmPassword} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted transition hover:text-white"><span className="sr-only">{showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}</span>{showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></div><span className="mt-1 block text-xs text-muted">Enter the same password again.</span></label>}
        {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">{isSignUp ? "Already have an account? " : "New to NyimboHub? "}<Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-semibold text-brand hover:underline">{isSignUp ? "Sign in" : "Create an account"}</Link></p>
    </section>
  );
}
