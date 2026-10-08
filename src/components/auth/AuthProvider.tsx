"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { auth } from "@/lib/auth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NeonAuthUIProvider
      authClient={auth}
      defaultTheme="dark"
    >
      {children}
    </NeonAuthUIProvider>
  );
}
