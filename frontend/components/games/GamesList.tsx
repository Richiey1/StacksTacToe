"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Coins, Users, Play, Loader2, AlertTriangle, Grid3x3, Trophy, Share2 } from "lucide-react";
import { useStacks } from "@/contexts/StacksProvider";
import { toast } from "react-hot-toast";
import { CountdownTimer } from "./CountdownTimer";
import { PlayerDisplay } from "./PlayerDisplay";
import { formatStx } from "@/lib/gameUtils";

export interface Game {
  id: string;
  gameId: bigint;
  player1: string;
  player2: string | null;
  betAmount: bigint;
  status: "waiting" | "active" | "finished";
  currentPlayer: string | null;
  winner: string | null;
  createdAt: Date;
  timeRemaining?: bigint | null;
  canForfeit?: boolean;
  boardSize?: number;
}

interface GamesListProps {
  games: Game[];
  loading?: boolean;
  onGameClick?: (gameId: bigint) => void;
}

export function GamesList({ games, loading = false, onGameClick }: GamesListProps) {
  const router = useRouter();
  const { address } = useStacks();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "text-gray-400 border-gray-400";
      case "active":
        return "text-orange-500 border-orange-500";
      case "finished":
        return "text-gray-600 border-gray-600";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  const canJoinGame = (game: Game) => {
    return game.status === "waiting" && game.player1.toLowerCase() !== address?.toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12 nes-container">
        <div className="text-gray-300 text-lg mb-4 font-pixel">No games available</div>
        <button
          onClick={() => router.push("/create")}
          className="btn-retro"
        >
          Create New Game
        </button>
      </div>
    );
  }

  const handleCardClick = (game: Game, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    if (game.status === "active" || game.status === "finished") {
      if (onGameClick) {
        onGameClick(game.gameId);
      } else {
        router.push(`/play/${game.gameId.toString()}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {games.map((game) => {
        const isClickable = game.status === "active" || game.status === "finished";
        const isDraw = game.status === "finished" && (!game.winner || game.winner === address);
        
        return (
        <div
          key={game.id}
          onClick={(e) => handleCardClick(game, e)}
          className={`nes-container transition-all hover:translate-x-1 hover:-translate-y-1 ${
            isClickable ? "cursor-pointer" : ""
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap font-pixel text-[10px]">
                  <span className={`px-2 py-1 border-2 uppercase font-bold ${getStatusColor(game.status)}`}>
                    {game.status}
                  </span>
                  {game.status === "finished" && isDraw && (
                    <span className="px-2 py-1 border-2 border-blue-400 text-blue-400 uppercase font-bold">
                      Draw
                    </span>
                  )}
                  {game.player1.toLowerCase() === address?.toLowerCase() && (
                    <span className="px-2 py-1 border-2 border-white text-white uppercase font-bold">
                      Your Game
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 md:hidden">
                  {game.status === "waiting" && game.player1.toLowerCase() === address?.toLowerCase() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = `${window.location.origin}/play/${game.gameId}`;
                        navigator.clipboard.writeText(link);
                        toast.success("Game link copied!");
                      }}
                      className="btn-retro !px-2 !py-1 !text-[10px]"
                    >
                      Share
                    </button>
                  )}
                  {canJoinGame(game) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onGameClick) {
                          onGameClick(game.gameId);
                        } else {
                          router.push(`/play/${game.gameId.toString()}`);
                        }
                      }}
                      className="btn-retro !px-2 !py-1 !text-[10px]"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlayerDisplay 
                  playerAddress={game.player1} 
                  isPlayer1={true}
                  isWinner={game.winner ? game.winner.toLowerCase() === game.player1.toLowerCase() : false}
                  showTrophy={true}
                  isFinishedGame={game.status === "finished"}
                  isDraw={isDraw}
                />

                {game.player2 ? (
                  <PlayerDisplay 
                    playerAddress={game.player2} 
                    isPlayer2={true}
                    isWinner={game.winner ? game.winner.toLowerCase() === game.player2.toLowerCase() : false}
                    showTrophy={true}
                    isFinishedGame={game.status === "finished"}
                    isDraw={isDraw}
                  />
                ) : (
                  <div className="flex items-center gap-3 text-gray-400 font-pixel text-xs">
                    <Clock className="w-4 h-4" />
                    <span>Waiting...</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 md:contents font-pixel text-xs text-gray-400">
                  <div className="flex items-center gap-3 text-white">
                    <Coins className="w-4 h-4 text-orange-500" />
                    <span>
                      {formatStx(game.betAmount)} STX
                    </span>
                  </div>

                  {game.boardSize && (
                    <div className="flex items-center gap-3 text-white">
                      <Grid3x3 className="w-4 h-4 text-orange-500" />
                      <span>{game.boardSize}x{game.boardSize}</span>
                    </div>
                  )}
                </div>

                {game.status === "active" && game.timeRemaining !== undefined && (
                  <div className="flex items-center gap-3">
                    {game.timeRemaining !== null ? (
                      <>
                        <CountdownTimer 
                          timeRemaining={game.timeRemaining} 
                          warningThreshold={3600}
                        />
                        {game.canForfeit && game.currentPlayer?.toLowerCase() !== address?.toLowerCase() && (
                          <span className="px-2 py-1 border-2 border-red-500 text-red-500 font-pixel text-[10px] uppercase font-bold animate-pulse">
                            Can Forfeit
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 font-pixel text-xs">
                        <Clock className="w-4 h-4" />
                        <span>Loading...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {game.status === "active" && (
                <div className="mt-4 p-3 border-2 border-orange-500/30 bg-orange-500/5">
                  <p className="text-[10px] text-orange-400 font-pixel leading-relaxed">
                    <AlertTriangle className="w-3 h-3 inline mr-2" />
                    Note: 24h move timeout applies. Claim reward if opponent stalls.
                  </p>
                </div>
              )}
            </div>

            <div className="hidden md:flex gap-3">
              {game.status === "waiting" && game.player1.toLowerCase() === address?.toLowerCase() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = `${window.location.origin}/play/${game.gameId}`;
                    navigator.clipboard.writeText(link);
                    toast.success("Link copied!");
                  }}
                  className="btn-retro-secondary"
                >
                  Share
                </button>
              )}
              {canJoinGame(game) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onGameClick) {
                      onGameClick(game.gameId);
                    } else {
                      router.push(`/play/${game.gameId.toString()}`);
                    }
                  }}
                  className="btn-retro"
                >
                  Join Game
                </button>
              )}
            </div>
          </div>
          {isClickable && (
            <div className="mt-4 text-[10px] text-gray-600 text-right font-pixel uppercase">
              {game.status === "finished" ? "View →" : "Play →"}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}
