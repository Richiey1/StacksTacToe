"use client";

import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";
import { NetworkBadge } from "@/components/NetworkBadge";
import { WalletButton } from "@/components/WalletButton";
import { useStacksWallet } from "@/hooks/useStacksWallet";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const wallet = useStacksWallet();
  const [darkMode, setDarkMode] = useState(true);

   useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

 return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-gradient-to-r from-[#0b1221]/90 via-[#0c1427]/80 to-[#0b1221]/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <NavLinks />
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun size={18} className="text-gray-300" />
            ) : (
              <Moon size={18} className="text-gray-300" />
            )}
          </button>
          
          <NetworkBadge network={wallet.network} />
          <WalletButton wallet={wallet} />
        </div>
      </div>
    </header>
  );
}
