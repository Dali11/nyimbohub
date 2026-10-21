import AuthForm from "@/components/auth/AuthForm";

export default function SignUpPage() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md"><AuthForm mode="sign-up" /></div>
    </main>
  );
}
