'use client'

import { useStacks } from '@/contexts/StacksProvider';
import { Wallet } from 'lucide-react';

export function Navbar() {
  const { isConnected, address, connect, disconnect } = useStacks();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-orange-500">STACKS</span>
              <span className="text-white">TacToe</span>
            </span>
          </div>

          {/* Connect Button */}
          <button
            onClick={isConnected ? disconnect : connect}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all border border-white/20"
          >
            <Wallet className="w-4 h-4" />
            {isConnected 
              ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
              : 'Connect Wallet'
            }
          </button>
        </div>
      </div>
    </nav>
  );
}
