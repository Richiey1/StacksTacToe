"use client";

import { useState } from "react";
import { Crown, Medal, Award, Loader2, Trophy } from "lucide-react";
import { useLeaderboard } from "@/hooks/useGameData";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { PlayerProfileModal } from "@/components/leaderboard/PlayerProfileModal";

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

export function LeaderboardContent() {
  const { data: leaderboardData, isLoading } = useLeaderboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"wins" | "games" | "winRate">("wins");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);

  const players = (leaderboardData || []).map((player: any) => {
    const wins = Number(player.wins || 0);
    const losses = Number(player.losses || 0);
    const draws = Number(player.draws || 0);
    const totalGames = wins + losses + draws;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    return {
      address: player.player,
      totalGames,
      wins,
      losses,
      draws,
      winRate,
      totalEarnings: 0, 
      currentStreak: 0,
      bestStreak: 0,
    };
  });

  const filteredPlayers = players.filter((player) =>
    player.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === "wins") return b.wins - a.wins;
    if (sortBy === "games") return b.totalGames - a.totalGames;
    if (sortBy === "winRate") return b.winRate - a.winRate;
    return 0;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  return (
    <>
      <div className="px-4 py-8 md:px-8 max-w-6xl mx-auto relative">
        <div className="blur-sm pointer-events-none opacity-50 grayscale">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase font-pixel tracking-widest">
              Hall of Fame
            </h1>
            <p className="text-gray-400 font-pixel text-xs uppercase tracking-tight">Top warriors ranked by performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="border-4 border-white/10 bg-white/5 p-6 font-pixel text-center">
              <p className="text-[10px] text-gray-400 mb-2 uppercase">TOTAL WARRIORS</p>
              <p className="text-2xl font-bold text-white">{players.length}</p>
            </div>
            <div className="border-4 border-white/10 bg-white/5 p-6 font-pixel text-center">
              <p className="text-[10px] text-gray-400 mb-2 uppercase">TOTAL BATTLES</p>
              <p className="text-2xl font-bold text-white">
                {players.reduce((sum, p) => sum + p.totalGames, 0)}
              </p>
            </div>
            <div className="border-4 border-white/10 bg-white/5 p-6 font-pixel text-center">
              <p className="text-[10px] text-gray-400 mb-2 uppercase">AVG WIN RATE</p>
              <p className="text-2xl font-bold text-white">
                {players.length > 0
                  ? (players.reduce((sum, p) => sum + p.winRate, 0) / players.length).toFixed(1)
                  : "0"}%
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/10 border-4 border-white/10 bg-white/5">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.address}
                className="flex items-center justify-between p-6 font-pixel"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <p className="text-white text-sm uppercase mb-1">
                      Warrior #{index + 1}
                    </p>
                    <p className="text-gray-400 text-[10px] font-mono">
                      {player.address.slice(0, 8)}...{player.address.slice(-6)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm uppercase">{player.wins} WINS</p>
                  <p className="text-gray-400 text-[10px] uppercase">
                    {player.winRate.toFixed(1)}% RATIO
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retro Coming Soon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="nes-container max-w-md w-full text-center z-20">
            <div className="flex justify-center mb-8">
              <Trophy className="w-16 h-16 text-orange-500 animate-pulse drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-6 font-pixel uppercase tracking-widest">
              LOCKED
            </h2>
            <p className="text-gray-400 font-pixel text-[10px] sm:text-xs leading-relaxed uppercase tracking-tighter">
              The Hall of Fame is being established. Join the battle to carve your name in history!
            </p>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-2 h-2 bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-orange-500 animate-bounce" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 bg-orange-500 animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        </div>
      </div>

      <PlayerProfileModal
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        stats={selectedPlayer}
      />
    </>
  );
}
