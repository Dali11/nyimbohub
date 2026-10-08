import { AuthView } from "@neondatabase/auth-ui";

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <AuthView pathname="/sign-in" />
      </div>
    </main>
  );
}
