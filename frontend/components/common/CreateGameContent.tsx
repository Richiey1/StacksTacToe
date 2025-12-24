'use client'

import { useStacks } from '@/contexts/StacksProvider';
import { Plus } from 'lucide-react';

export function CreateGameContent() {
  const { isConnected } = useStacks();

  if (!isConnected) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <Plus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">Connect your Stacks wallet to create a game</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Game</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bet Amount (STX)
          </label>
          <input
            type="number"
            placeholder="1.0"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Board Size
          </label>
          <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500">
            <option value="3">3x3 (Classic)</option>
            <option value="5">5x5 (Advanced)</option>
          </select>
        </div>

        <button className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
          Create Game
        </button>
      </div>
    </div>
  );
}
