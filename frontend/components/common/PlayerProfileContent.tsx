'use client'

import { useState } from 'react';
import { User, Trophy, Coins, Swords, Shield, Star, Clock } from 'lucide-react';
import { useStacks } from '@/contexts/StacksProvider';
import { useLeaderboard, useGameList } from '@/hooks/useGameData';
import { formatStx } from '@/lib/gameUtils';

export function PlayerProfileContent() {
  const { address } = useStacks();
  const { data: leaderboardData } = useLeaderboard();
  const { data: gamesData, isLoading: isLoadingGames } = useGameList();

  // Find user in leaderboard
  const playerStats = (leaderboardData || []).find(
    (p: any) => p.player && typeof p.player === 'string' && p.player.toLowerCase() === address?.toLowerCase()
  );

  const wins = Number(playerStats?.wins || 0);

  // Filter user's recent games
  const userGames = (gamesData || []).filter(
    game => (game.playerOne && typeof game.playerOne === 'string' && game.playerOne.toLowerCase() === address?.toLowerCase()) || 
            (game.playerTwo && typeof game.playerTwo === 'string' && game.playerTwo.toLowerCase() === address?.toLowerCase())
  );

  // Calculate battles from game history to be more accurate
  const totalGames = userGames.length;
  const defeats = userGames.filter(game => {
    if (game.status === 0) return false; // Still active or waiting
    if (!game.winner) return false; // Draw
    return typeof game.winner === 'string' && game.winner.toLowerCase() !== address?.toLowerCase();
  }).length;
  
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-pixel">
        <Shield className="w-16 h-16 text-gray-500 mb-6" />
        <p className="text-gray-400 text-sm uppercase tracking-widest">Connect wallet to view profile</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:px-8 max-w-6xl mx-auto space-y-10 font-pixel uppercase animate-fade-in">
      {/* Header / Identity */}
      <div className="flex flex-col md:flex-row items-center gap-8 border-b-4 border-white/10 pb-10">
        <div className="w-24 h-24 bg-orange-500/10 border-4 border-orange-500 flex items-center justify-center relative">
           <User className="w-12 h-12 text-orange-500" />
           <div className="absolute -bottom-2 -right-2 bg-black border-2 border-white px-2 py-0.5 text-[8px] text-white tracking-normal">LVL 1</div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-widest">Warrior Profile</h1>
          <p className="text-gray-400 text-[10px] font-mono lowercase tracking-normal break-all">{address}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border-4 border-white/10 bg-white/5 p-6 text-center">
          <p className="text-[8px] text-gray-400 mb-3 tracking-widest">BATTLES</p>
          <p className="text-2xl font-bold text-white">{totalGames}</p>
        </div>
        <div className="border-4 border-white/10 bg-white/5 p-6 text-center">
          <p className="text-[8px] text-gray-400 mb-3 tracking-widest">VICTORIES</p>
          <p className="text-2xl font-bold text-green-400">{wins}</p>
        </div>
        <div className="border-4 border-white/10 bg-white/5 p-6 text-center">
          <p className="text-[8px] text-gray-400 mb-3 tracking-widest">DEFEATS</p>
          <p className="text-2xl font-bold text-red-400">{defeats}</p>
        </div>
        <div className="border-4 border-white/10 bg-white/5 p-6 text-center">
          <p className="text-[8px] text-gray-400 mb-3 tracking-widest">WIN RATIO</p>
          <p className="text-2xl font-bold text-blue-400">{winRate}%</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <Clock className="w-6 h-6 text-gray-400" />
          <h2 className="text-lg font-bold text-white tracking-wider">Battle Log</h2>
        </div>

        {userGames.length > 0 ? (
          <div className="space-y-4">
            {userGames.slice(0, 5).map((game) => {
              let outcome = "DRAW";
              if (game.status === 2) {
                outcome = "FORFEIT";
              } else if (game.winner) {
                if (typeof game.winner === 'string') {
                  outcome = game.winner.toLowerCase() === address.toLowerCase() ? "WIN" : "LOSS";
                }
              }
              
              return (
                <div key={game.id} className="flex items-center justify-between p-4 border-2 border-white/5 bg-white/5 text-[10px]">
                  <div className="flex items-center gap-4">
                    <span className={
                      outcome === "WIN" ? "text-green-400" : outcome === "LOSS" ? "text-red-400" : "text-blue-400"
                    }>
                      {outcome}
                    </span>
                    <span className="text-gray-500">ID #{game.id}</span>
                  </div>
                  <div className="text-right text-gray-400">
                    {formatStx(game.betAmount)} STX
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border-4 border-dashed border-white/5 text-gray-500 text-xs">
            No recent battles recorded
          </div>
        )}
      </div>
    </div>
  );
}
