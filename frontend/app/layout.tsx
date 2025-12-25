import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StacksProvider } from "@/contexts/StacksProvider";
import { Navbar } from "@/components/common/Navbar";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";
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
  title: "StacksTacToe - Decentralized Tic-Tac-Toe",
  description: "Play Tic-Tac-Toe on the Stacks blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black min-h-screen`}
      >
        <Providers>
          <StacksProvider>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
              {children}
            </div>
            <Toaster position="top-right" />
          </StacksProvider>
        </Providers>
      </body>
    </html>
  );
}
