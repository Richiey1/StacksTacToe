'use client'

import { useStacks } from '@/contexts/StacksProvider';
import { Gamepad2 } from 'lucide-react';
import { TabType } from '@/app/page';

interface GamesContentProps {
  onTabChange: (tab: TabType) => void;
}

export function GamesContent({ onTabChange }: GamesContentProps) {
  const { isConnected } = useStacks();

  if (!isConnected) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">Connect your Stacks wallet to view and join games</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Available Games</h2>
        <button
          onClick={() => onTabChange('create')}
          className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
        >
          Create Game
        </button>
      </div>

      <div className="text-center py-12">
        <p className="text-gray-400">No active games yet. Create one to get started!</p>
      </div>
    </div>
  );
}
