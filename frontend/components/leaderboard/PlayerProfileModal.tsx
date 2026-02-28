"use client";

import { X, Trophy, Target, TrendingUp, Coins, Calendar, User } from "lucide-react";
import { formatStx } from "@/lib/gameUtils";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="nes-container max-w-2xl w-full max-h-[90vh] overflow-y-auto !p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b-4 border-white/10 pb-8 font-pixel">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 border-4 border-orange-500 bg-orange-500/10 flex items-center justify-center">
              <User className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">Warrior Intel</h2>
              <p className="text-[10px] text-gray-400 font-mono break-all lowercase tracking-normal">
                {stats.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-retro !p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 font-pixel">
          <div className="border-4 border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-4 h-4 text-blue-400" />
              <p className="text-[10px] text-gray-400 uppercase">Battles</p>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalGames}</p>
          </div>

          <div className="border-4 border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-4 h-4 text-green-400" />
              <p className="text-[10px] text-gray-400 uppercase">Victories</p>
            </div>
            <p className="text-xl font-bold text-green-400">{stats.wins}</p>
          </div>

          <div className="border-4 border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Coins className="w-4 h-4 text-orange-500" />
              <p className="text-[10px] text-gray-400 uppercase">Earnings</p>
            </div>
            <p className="text-xl font-bold text-orange-500">{formatStx(stats.totalEarnings * 1_000_000)} STX</p>
          </div>
        </div>

        {/* Closing Action */}
        <button
          onClick={onClose}
          className="btn-retro w-full py-4 text-sm"
        >
          Return to Arena
        </button>
      </div>
    </div>
  );
}

// Simple Crown icon for victory
function Crown({ className, textGreen }: { className?: string, textGreen?: string }) {
  return (
    <Trophy className={className} />
  );
}
