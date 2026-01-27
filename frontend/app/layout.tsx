import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import { StacksProvider } from "@/contexts/StacksProvider";
import { Navbar } from "@/components/common/Navbar";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";
import { ReownProvider } from "@/contexts/ReownProvider";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pressStart2P.variable} antialiased bg-game-dark min-h-screen font-game`}
        suppressHydrationWarning
      >
        <Providers>
          <ReownProvider>
            <StacksProvider>
              <Navbar />
              <div className="min-h-screen bg-game-pattern">
                {children}
              </div>
              <Toaster 
                position="top-right" 
                toastOptions={{
                  style: {
                    border: '2px solid #4ADE80',
                    padding: '16px',
                    color: '#4ADE80',
                    background: '#000000',
                    fontFamily: 'var(--font-press-start-2p)',
                    fontSize: '12px',
                  },
                }}
              />
            </StacksProvider>
          </ReownProvider>
        </Providers>
      </body>
    </html>
  );
}
