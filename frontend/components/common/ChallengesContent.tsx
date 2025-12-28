'use client'

import { useState } from 'react';
import { Swords, Plus, Filter } from 'lucide-react';
import { ChallengeModal } from '@/components/challenges/ChallengeModal';
import { ChallengeList } from '@/components/challenges/ChallengeList';
import { useGameList } from '@/hooks/useGameData';
import { useStacksTacToe } from '@/hooks/useStacksTacToe';
import { toast } from 'react-hot-toast';

export function ChallengesContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my' | 'open'>('open');
  
  // Get all games and filter for "waiting" status (open challenges)
  const { data: gamesData, isLoading } = useGameList();
  const { joinGame } = useStacksTacToe();

  // Transform games into challenges
  const allChallenges = (gamesData?.games || [])
    .filter(game => game.status === 'waiting') // Only waiting games are open challenges
    .map(game => ({
      gameId: game.id,
      creator: game.player1,
      betAmount: Number(game.betAmount),
      boardSize: game.boardSize,
      createdAt: game.lastMoveBlock,
      status: 'open' as const
    }));

  // Apply filters
  const filteredChallenges = allChallenges.filter(challenge => {
    if (filter === 'open') return true;
    // Add more filter logic here if needed
    return true;
  });

  const handleAcceptChallenge = async (gameId: bigint) => {
    try {
      const challenge = allChallenges.find(c => c.gameId === gameId);
      if (!challenge) return;

      // Join the game with center cell as first move
      const centerCell = challenge.boardSize === 3 ? 4 : 12;
      await joinGame(Number(gameId), centerCell);
      toast.success("Challenge accepted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to accept challenge");
    }
  };

  return (
    \u003c\u003e
      \u003cdiv className="px-4 py-8 md:px-8 max-w-6xl mx-auto"\u003e
        {/* Header */}
        \u003cdiv className="flex items-center justify-between mb-8"\u003e
          \u003cdiv className="flex items-center gap-3"\u003e
            \u003cdiv className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30"\u003e
              \u003cSwords className="w-6 h-6 text-blue-400" /\u003e
            \u003c/div\u003e
            \u003cdiv\u003e
              \u003ch1 className="text-3xl font-bold text-white"\u003eChallenges\u003c/h1\u003e
              \u003cp className="text-gray-400"\u003eCreate or accept challenges\u003c/p\u003e
            \u003c/div\u003e
          \u003c/div\u003e

          \u003cbutton
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25"
          \u003e
            \u003cPlus className="w-5 h-5" /\u003e
            Create Challenge
          \u003c/button\u003e
        \u003c/div\u003e

        {/* Stats */}
        \u003cdiv className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"\u003e
          \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-4"\u003e
            \u003cp className="text-sm text-gray-400 mb-1"\u003eOpen Challenges\u003c/p\u003e
            \u003cp className="text-2xl font-bold text-white"\u003e{allChallenges.length}\u003c/p\u003e
          \u003c/div\u003e
          \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-4"\u003e
            \u003cp className="text-sm text-gray-400 mb-1"\u003eTotal Pot\u003c/p\u003e
            \u003cp className="text-2xl font-bold text-white"\u003e
              {(allChallenges.reduce((sum, c) => sum + c.betAmount, 0) / 1_000_000 * 2).toFixed(1)} STX
            \u003c/p\u003e
          \u003c/div\u003e
          \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-4"\u003e
            \u003cp className="text-sm text-gray-400 mb-1"\u003eAvg Bet\u003c/p\u003e
            \u003cp className="text-2xl font-bold text-white"\u003e
              {allChallenges.length > 0 
                ? (allChallenges.reduce((sum, c) => sum + c.betAmount, 0) / allChallenges.length / 1_000_000).toFixed(2)
                : '0'} STX
            \u003c/p\u003e
          \u003c/div\u003e
        \u003c/div\u003e

        {/* Challenge List */}
        \u003cChallengeList
          challenges={filteredChallenges}
          isLoading={isLoading}
          onAccept={handleAcceptChallenge}
        /\u003e
      \u003c/div\u003e

      {/* Create Challenge Modal */}
      \u003cChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /\u003e
    \u003c/\u003e
  );
}
