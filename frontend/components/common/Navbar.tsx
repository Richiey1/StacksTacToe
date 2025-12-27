'use client'

import { WalletButton } from '@/components/WalletButton';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { Grid3x3 } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl">
              <Grid3x3 className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-orange-500">STACKS</span>
              <span className="text-white">TacToe</span>
            </span>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center gap-3">
             <WalletConnectButton />
             <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
