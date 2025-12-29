"use client";

import { useState } from "react";
import { Trophy, Medal, Award, Loader2, Swords } from "lucide-react";
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

  // Transform leaderboard data
  const players = (leaderboardData || []).map((player: any) => {
    const totalGames = player.gamesPlayed || 0;
    const wins = player.wins || 0;
    const losses = player.losses || 0;
    const draws = totalGames - wins - losses;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    return {
      address: player.player,
      totalGames,
      wins,
      losses,
      draws,
      winRate,
      totalEarnings: 0, // TODO: Calculate from game history
      currentStreak: 0, // TODO: Calculate from recent games
      bestStreak: 0, // TODO: Calculate from game history
    };
  });

  // Filter players
  const filteredPlayers = players.filter((player) =>
    player.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === "wins") return b.wins - a.wins;
    if (sortBy === "games") return b.totalGames - a.totalGames;
    if (sortBy === "winRate") return b.winRate - a.winRate;
    return 0;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  return (
    <>
      <div className="px-4 py-8 md:px-8 max-w-6xl mx-auto relative">
        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              Leaderboard
            </h1>
            <p className="text-gray-400">Top players ranked by performance</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Total Players</p>
              <p className="text-2xl font-bold text-white">{players.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Total Games</p>
              <p className="text-2xl font-bold text-white">
                {players.reduce((sum, p) => sum + p.totalGames, 0)}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Avg Win Rate</p>
              <p className="text-2xl font-bold text-white">
                {players.length > 0
                  ? (players.reduce((sum, p) => sum + p.winRate, 0) / players.length).toFixed(1)
                  : "0"}%
              </p>
            </div>
          </div>

          {/* Filters */}
          <LeaderboardFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Leaderboard Table */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
              </div>
            ) : sortedPlayers.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 text-lg">
                  {searchTerm ? "No players found" : "No players yet"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchTerm ? "Try a different search term" : "Be the first to play!"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.address}
                    onClick={() => setSelectedPlayer(player)}
                    className="flex items-center justify-between p-4 sm:p-6 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          Player #{index + 1}
                        </p>
                        <p className="text-gray-400 text-sm font-mono">
                          {player.address.slice(0, 6)}...{player.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{player.wins} wins</p>
                      <p className="text-gray-400 text-sm">
                        {player.winRate.toFixed(1)}% win rate
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon Overlay - Centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-[#1a1d3a]/95 border-2 border-orange-500/50 rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm shadow-2xl max-w-md pointer-events-auto">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-orange-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-orange-400 mb-3">
              Coming Soon
            </h2>
            <p className="text-gray-300 text-base md:text-lg">
              The Leaderboard feature is being enhanced and will be available soon!
            </p>
          </div>
        </div>
      </div>

      {/* Player Profile Modal */}
      <PlayerProfileModal
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        stats={selectedPlayer}
      />
    </>
  );
}
