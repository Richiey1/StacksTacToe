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
  const [sortBy, setSortBy] = useState<"wins" | "earnings" | "winRate">("wins");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);

  const players = (leaderboardData || []).map((player: any) => {
    const wins = Number(player.wins || 0);
    const losses = Number(player.losses || 0);
    const draws = Number(player.draws || 0);
    const totalEarnings = Number(player.totalEarned || 0) / 1000000;
    const totalGames = wins + losses + draws;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    return {
      address: player.player || "",
      totalGames,
      wins,
      losses,
      draws,
      winRate,
      totalEarnings, 
      currentStreak: 0,
      bestStreak: 0,
    };
  });

  const filteredPlayers = players.filter((player) =>
    player.address && player.address.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === "wins") return b.wins - a.wins;
    if (sortBy === "earnings") return b.totalEarnings - a.totalEarnings;
    if (sortBy === "winRate") return b.winRate - a.winRate;
    return 0;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-orange-500 font-pixel text-xs uppercase">Retrieving Hall of Fame...</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-8 md:px-8 max-w-6xl mx-auto relative">
        <div className="">
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
              <p className="text-[10px] text-gray-400 mb-2 uppercase">TOTAL EARNINGS</p>
              <p className="text-2xl font-bold text-white">
                {players.reduce((sum, p) => sum + p.totalEarnings, 0).toFixed(2)} STX
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

          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
             <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="SEARCH WARRIOR..."
                  className="w-full bg-black border-4 border-white/10 p-2 text-white font-pixel text-[10px] focus:border-orange-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => setSortBy("wins")}
                  className={`px-3 py-1 font-pixel text-[8px] uppercase border-2 ${sortBy === 'wins' ? 'border-orange-500 text-orange-500' : 'border-white/10 text-gray-400'}`}
                >
                  WINS
                </button>
                <button 
                  onClick={() => setSortBy("earnings")}
                  className={`px-3 py-1 font-pixel text-[8px] uppercase border-2 ${sortBy === 'earnings' ? 'border-orange-500 text-orange-500' : 'border-white/10 text-gray-400'}`}
                >
                  EARNINGS
                </button>
             </div>
          </div>

          <div className="divide-y divide-white/10 border-4 border-white/10 bg-white/5">
            {sortedPlayers.length > 0 ? sortedPlayers.map((player, index) => (
              <div
                key={player.address}
                className="flex items-center justify-between p-6 font-pixel hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <p className="text-white text-sm uppercase mb-1">
                      {player.address.slice(0, 8)}...{player.address.slice(-6)}
                    </p>
                    <p className="text-orange-500 text-[10px] uppercase">
                      {player.totalEarnings.toFixed(2)} STX EARNED
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
            )) : (
              <div className="p-12 text-center font-pixel text-gray-500 uppercase text-xs">
                No warriors found in the Hall of Fame
              </div>
            )}
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
