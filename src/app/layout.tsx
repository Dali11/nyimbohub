import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import PlayerProvider from "@/components/player/PlayerProvider";
import PlayerBar from "@/components/player/PlayerBar";
import AuthProvider from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const instant = false;

export const metadata: Metadata = {
  title: "NyimboHub — Malawi's Music Platform",
  description:
    "Stream, download and watch music from Malawi's upcoming artists. Real music. Real stories. One hub.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen">
        <AuthProvider>
          <PlayerProvider>
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>

            <main className="pb-44 md:pb-28">{children}</main>

            <PlayerBar />

            <Suspense fallback={null}>
              <MobileTabBar />
            </Suspense>
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
