import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StacksProvider } from "@/contexts/StacksProvider";
import { Navbar } from "@/components/common/Navbar";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StacksTacToe - Blockchain Tic-Tac-Toe",
  description: "Play provably fair Tic-Tac-Toe games on the Stacks blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased stackstactoe-bg`}
      >
        <StacksProvider>
          <div className="min-h-screen flex flex-col relative">
            <Navbar />
            <main className="flex-1 relative">
              {children}
            </main>
          </div>
          <Toaster position="bottom-right" />
        </StacksProvider>
      </body>
    </html>
  );
}
