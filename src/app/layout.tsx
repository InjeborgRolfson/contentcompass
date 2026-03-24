import type { Metadata } from "next";
import { Geist, Geist_Mono, Gloock, Playpen_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import WelcomeModal from "@/components/WelcomeModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gloock = Gloock({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gloock",
});

const playpenSans = Playpen_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-marco-one",
});

export const metadata: Metadata = {
  title: "ContentCompass",
  description: "Personalized content recommendation engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gloock.variable} ${playpenSans.variable} antialiased h-full bg-[#f8f9fc] text-theme-900 font-sans`}
      >
        <SessionProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pb-16 md:pb-0">
                {children}
              </main>
              <WelcomeModal />
              <BottomNav />
            </div>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
