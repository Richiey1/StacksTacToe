'use client'

import Link from 'next/link';
import { WalletButton } from '@/components/WalletButton';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { Grid3x3 } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-game-dark border-b-4 border-game-primary h-24">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 cursor-pointer group">
          <div className="border-2 border-game-primary p-1 bg-game-panel group-hover:bg-game-primary group-hover:text-black transition-colors">
            <Grid3x3 className="w-8 h-8" />
          </div>
          <span className="text-xl md:text-2xl font-bold tracking-widest text-white retro-text-shadow">
            <span className="text-game-primary">STACKS</span>
            <span className="text-white">TAC</span>
            <span className="text-game-secondary">TOE</span>
          </span>
        </Link>

        {/* Wallet Button */}
        <div className="flex items-center gap-4">
           {/* Wrapped in div to apply potential retro styling to children if possible, 
               but WalletButton might be a complex component. 
               For now, we leave it, but maybe wrap it in a NES-container style if needed. */}
           <WalletConnectButton />
           <WalletButton />
        </div>
      </div>
    </nav>
  );
}
