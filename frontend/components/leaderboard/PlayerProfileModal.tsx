"use client";

import { X, Trophy, Target, TrendingUp, Coins, Calendar } from "lucide-react";

interface PlayerStats {
  address: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalEarnings: number;
  currentStreak: number;
  bestStreak: number;
}

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats | null;
}

export function PlayerProfileModal({ isOpen, onClose, stats }: PlayerProfileModalProps) {
  if (!isOpen || !stats) return null;

  return (
    \u003cdiv className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"\u003e
      \u003cdiv className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"\u003e
        {/* Header */}
        \u003cdiv className="flex items-center justify-between mb-6"\u003e
          \u003cdiv className="flex items-center gap-3"\u003e
            \u003cdiv className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"\u003e
              \u003cTrophy className="w-8 h-8 text-white" /\u003e
            \u003c/div\u003e
            \u003cdiv\u003e
              \u003ch2 className="text-2xl font-bold text-white"\u003ePlayer Profile\u003c/h2\u003e
              \u003cp className="text-sm text-gray-400 font-mono"\u003e
                {stats.address.slice(0, 8)}...{stats.address.slice(-6)}
              \u003c/p\u003e
            \u003c/div\u003e
          \u003c/div\u003e
          \u003cbutton
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"\u003e
            \u003cX className="w-5 h-5 text-gray-400" /\u003e
          \u003c/button\u003e
        \u003c/div\u003e

        {/* Stats Grid */}
        \u003cdiv className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"\u003e
          {/* Total Games */}
          \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-4"\u003e
            \u003cdiv className="flex items-center gap-2 mb-2"\u003e
              \u003cTarget className="w-4 h-4 text-blue-400" /\u003e
              \u003cp className="text-sm text-gray-400"\u003eTotal Games\u003c/p\u003e
            \u003c/div\u003e
            \u003cp className="text-2xl font-bold text-white"\u003e{stats.totalGames}\u003c/p\u003e
          \u003c/div\u003e

          {/* Wins */}
          \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-4"\u003e
            \u003cdiv className="flex items-center gap-2 mb-2"\u003e
              \u003cTrophy className="w-4 h-4 text-green-400" /\u003e
              \u003cp className="text-sm text-gray-400"\u003eWins\u003c/p\u003e
            \u003c/div\u003e
            \u003cp className="text-2xl font-bold text-green-400"\u003e{stats.wins}\u003c/p\u003e
          \u003c/div\u003e

          {/* Win Rate */}
          \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-4"\u003e
            \u003cdiv className="flex items-center gap-2 mb-2"\u003e
              \u003cTrendingUp className="w-4 h-4 text-purple-400" /\u003e
              \u003cp className="text-sm text-gray-400"\u003eWin Rate\u003c/p\u003e
            \u003c/div\u003e
            \u003cp className="text-2xl font-bold text-purple-400"\u003e{stats.winRate.toFixed(1)}%\u003c/p\u003e
          \u003c/div\u003e

          {/* Losses */}
          \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-4"\u003e
            \u003cdiv className="flex items-center gap-2 mb-2"\u003e
              \u003cX className="w-4 h-4 text-red-400" /\u003e
              \u003cp className="text-sm text-gray-400"\u003eLosses\u003c/p\u003e
            \u003c/div\u003e
            \u003cp className="text-2xl font-bold text-red-400"\u003e{stats.losses}\u003c/p\u003e
          \u003c/div\u003e

          {/* Draws */}
          \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-4"\u003e
            \u003cdiv className="flex items-center gap-2 mb-2"\u003e
              \u003cCalendar className="w-4 h-4 text-gray-400" /\u003e
              \u003cp className="text-sm text-gray-400"\u003eDraws\u003c/p\u003e
            \u003c/div\u003e
            \u003cp className="text-2xl font-bold text-gray-400"\u003e{stats.draws}\u003c/p\u003e
          \u003c/div\u003e

          {/* Total Earnings */}
          \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-4"\u003e
            \u003cdiv className="flex items-center gap-2 mb-2"\u003e
              \u003cCoins className="w-4 h-4 text-orange-400" /\u003e
              \u003cp className="text-sm text-gray-400"\u003eEarnings\u003c/p\u003e
            \u003c/div\u003e
            \u003cp className="text-2xl font-bold text-orange-400"\u003e{stats.totalEarnings.toFixed(2)} STX\u003c/p\u003e
          \u003c/div\u003e
        \u003c/div\u003e

        {/* Streaks */}
        \u003cdiv className="grid grid-cols-2 gap-4"\u003e
          \u003cdiv className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4"\u003e
            \u003cp className="text-sm text-yellow-400 mb-1"\u003eCurrent Streak\u003c/p\u003e
            \u003cp className="text-3xl font-bold text-white"\u003e{stats.currentStreak} 🔥\u003c/p\u003e
          \u003c/div\u003e
          \u003cdiv className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4"\u003e
            \u003cp className="text-sm text-blue-400 mb-1"\u003eBest Streak\u003c/p\u003e
            \u003cp className="text-3xl font-bold text-white"\u003e{stats.bestStreak} ⭐\u003c/p\u003e
          \u003c/div\u003e
        \u003c/div\u003e
      \u003c/div\u003e
    \u003c/div\u003e
  );
}
