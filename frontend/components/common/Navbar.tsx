'use client'

import { Logo } from '@/components/Logo';
import { WalletButton } from '@/components/WalletButton';
import { WalletConnectButton } from '@/components/WalletConnectButton';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-orange-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Logo />

          {/* Wallet Button */}
          <div className="flex items-center gap-3">
             <div className="hidden sm:block">
               <WalletConnectButton />
             </div>
             <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
