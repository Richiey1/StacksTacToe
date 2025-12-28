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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Player Profile</h2>
              <p className="text-sm text-gray-400 font-mono">
                {stats.address.slice(0, 8)}...{stats.address.slice(-6)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Total Games */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <p className="text-sm text-gray-400">Total Games</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
          </div>

          {/* Wins */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-green-400" />
              <p className="text-sm text-gray-400">Wins</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
          </div>

          {/* Win Rate */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <p className="text-sm text-gray-400">Win Rate</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.winRate.toFixed(1)}%</p>
          </div>

          {/* Losses */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-4 h-4 text-red-400" />
              <p className="text-sm text-gray-400">Losses</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.losses}</p>
          </div>

          {/* Draws */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-400">Draws</p>
            </div>
            <p className="text-2xl font-bold text-gray-400">{stats.draws}</p>
          </div>

          {/* Total Earnings */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-orange-400" />
              <p className="text-sm text-gray-400">Earnings</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.totalEarnings.toFixed(2)} STX</p>
          </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-sm text-yellow-400 mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-white">{stats.currentStreak} 🔥</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-blue-400 mb-1">Best Streak</p>
            <p className="text-3xl font-bold text-white">{stats.bestStreak} ⭐</p>
          </div>
        </div>
      </div>
    </div>
  );
}
