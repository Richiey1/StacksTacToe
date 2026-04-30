import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Space_Mono } from "next/font/google";
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

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stackstactoe.vercel.app'),
  title: {
    default: "StacksTacToe — Bitcoin Tic-Tac-Toe Arena",
    template: "%s | StacksTacToe",
  },
  description:
    "Play decentralized Tic-Tac-Toe on Stacks L2. Bet STX, challenge opponents, win on-chain. Provably fair, Bitcoin-secured PvP gaming.",
  keywords: ["Stacks", "Bitcoin", "tic-tac-toe", "game", "PvP", "betting", "blockchain", "L2", "DeFi"],
  authors: [{ name: "StacksTacToe Protocol" }],
  creator: "StacksTacToe",
  openGraph: {
    title: "StacksTacToe — Bitcoin Tic-Tac-Toe Arena",
    description: "Bet STX. Challenge opponents. Win on-chain. Bitcoin-secured PvP gaming on Stacks L2.",
    type: "website",
    siteName: "StacksTacToe",
    images: [{ url: "/logo.svg", width: 64, height: 64, alt: "StacksTacToe Logo" }],
  },
  twitter: {
    card: "summary",
    title: "StacksTacToe — Bitcoin Tic-Tac-Toe Arena",
    description: "Decentralized Tic-Tac-Toe on Stacks L2. Bet STX, play opponents, win Bitcoin-secured prizes.",
    images: ["/logo.svg"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.svg",
    shortcut: "/favicon.svg",
  },
  other: {
    "talentapp:project_verification": "4973ef29e148f19c63b948f1ea3900f289b641ecbde3140a9f0b32c5df8daca90c1ddbe1937b26c5b86e0b886e723785e3603705f6f1f81a176ecaa92e12287e",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pressStart2P.variable} ${spaceMono.variable} antialiased bg-black min-h-screen`}
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
