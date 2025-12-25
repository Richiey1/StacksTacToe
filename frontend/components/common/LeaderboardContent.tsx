"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { fetchCallReadOnlyFunction } from "@stacks/transactions";
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from "@/lib/stacksConfig";
import { cvToValue } from "@stacks/transactions";

interface LeaderboardPlayer {
  address: string;
  username: string;
  wins: number;
  rating: number;
  rank: number;
}

export function LeaderboardContent() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Get total players
        const totalPlayersResult = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: "get-total-players",
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS,
        });

        const totalPlayers = Number(cvToValue(totalPlayersResult).value || 0);
        
        // For now, show placeholder data
        // TODO: Implement actual player data fetching
        setPlayers([]);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  return (
    <div className="px-2 sm:px-4 py-4 sm:py-6 md:px-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-400">Top players ranked by rating and wins</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          ) : players.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 text-lg">No players yet</p>
              <p className="text-gray-500 text-sm mt-2">Be the first to register and play!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {players.map((player, index) => (
                <div
                  key={player.address}
                  className="flex items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(player.rank)}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{player.username}</p>
                      <p className="text-gray-400 text-sm font-mono">
                        {player.address.slice(0, 6)}...{player.address.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{player.rating} pts</p>
                    <p className="text-gray-400 text-sm">{player.wins} wins</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
