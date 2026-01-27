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
        className={`${pressStart2P.variable} antialiased bg-black min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <ReownProvider>
            <StacksProvider>
              <Navbar />
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 font-pixel text-gray-300">
                {children}
              </div>
              <Toaster position="top-right" 
                toastOptions={{
                  style: {
                    fontFamily: 'var(--font-press-start-2p)',
                    borderRadius: '0px',
                    border: '2px solid #F97316',
                    background: '#000',
                    color: '#fff',
                  }
                }}
              />
            </StacksProvider>
          </ReownProvider>
        </Providers>
      </body>
    </html>
  );
}
