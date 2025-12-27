"use client";

import { useState, useEffect, useCallback } from "react";
import { useStacks } from "@/contexts/StacksProvider";
import { GamesList, Game } from "@/components/games/GamesList";
import { GameModal } from "@/components/games/GameModal";
import { TabType } from "@/components/common/TabNavigation";
import { Plus, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { fetchCallReadOnlyFunction } from "@stacks/transactions";
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from "@/lib/stacksConfig";
import { cvToValue, hexToCV } from "@stacks/transactions";



interface GamesContentProps {
  onTabChange?: (tab: TabType) => void;
  initialGameId?: bigint | null;
}

export function GamesContent({ onTabChange, initialGameId }: GamesContentProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState<bigint | null>(initialGameId || null);
  const [isModalOpen, setIsModalOpen] = useState(!!initialGameId);
  const [showActiveGames, setShowActiveGames] = useState(false);
  const [showPastGames, setShowPastGames] = useState(false);
  const { address } = useStacks();

  const loadGameData = useCallback(async (gameId: bigint): Promise<Game | null> => {
    try {
      const result = await fetchCallReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-game",
        functionArgs: [hexToCV(`0x${gameId.toString(16).padStart(32, '0')}`)],
        senderAddress: CONTRACT_ADDRESS,
      });

      const gameData = cvToValue(result);
      
      if (!gameData || !gameData.value) return null;

      const game = gameData.value;
      const playerOne = game["player-one"].value;
      const playerTwo = game["player-two"].value;
      const betAmount = BigInt(game["bet-amount"].value);
      const status = Number(game.status.value);
      const winner = game.winner.value;
      const boardSize = Number(game["board-size"]?.value || 3);

      let gameStatus: "waiting" | "active" | "finished" = "waiting";
      if (status === 1 || status === 2) {
        gameStatus = "finished";
      } else if (playerTwo && playerTwo !== "none") {
        gameStatus = "active";
      }

      // Get time remaining for active games
      let timeRemaining: bigint | null = null;
      if (gameStatus === "active") {
        try {
          const timeResult = await fetchCallReadOnlyFunction({
            network: NETWORK,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-time-remaining",
            functionArgs: [hexToCV(`0x${gameId.toString(16).padStart(32, '0')}`)],
            senderAddress: CONTRACT_ADDRESS,
          });
          const timeValue = cvToValue(timeResult);
          timeRemaining = BigInt(timeValue.value || 0);
        } catch {
          // Ignore errors
        }
      }

      return {
        id: gameId.toString(),
        gameId,
        player1: playerOne,
        player2: playerTwo && playerTwo !== "none" ? playerTwo : null,
        betAmount,
        status: gameStatus,
        currentPlayer: game["is-player-one-turn"]?.value ? playerOne : playerTwo,
        winner: winner && winner !== "none" ? winner : null,
        createdAt: new Date(),
        timeRemaining,
        canForfeit: timeRemaining === BigInt(0),
        boardSize,
      } as Game;
    } catch (error) {
      console.error(`Failed to load game ${gameId}:`, error);
      return null;
    }
  }, []);

  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      // Get latest game ID
      const latestIdResult = await fetchCallReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-latest-game-id",
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
      });

      const latestId = cvToValue(latestIdResult);
      const gameCount = Number(latestId.value || 0);

      const allGames: Game[] = [];
      
      // Load games in batches
      for (let i = 0; i < gameCount; i++) {
        const game = await loadGameData(BigInt(i));
        if (game) {
          allGames.push(game);
        }
        // Small delay to avoid overwhelming the network
        if (i % 5 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setGames(allGames);
    } catch (error) {
      console.error("Failed to load games:", error);
    } finally {
      setLoading(false);
    }
  }, [loadGameData]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const handleGameClick = (gameId: bigint) => {
    setSelectedGameId(gameId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGameId(null);
    // Refresh games after modal closes
    loadGames();
  };

  const waitingGames = games.filter(g => g.status === "waiting");
  const myActiveGames = address
    ? games.filter(g => {
        if (g.status !== "active") return false;
        return g.player1.toLowerCase() === address.toLowerCase() ||
               g.player2?.toLowerCase() === address.toLowerCase();
      })
    : [];
  const myPastGames = address
    ? games.filter(g => {
        if (g.status !== "finished") return false;
        return g.player1.toLowerCase() === address.toLowerCase() ||
               g.player2?.toLowerCase() === address.toLowerCase();
      })
    : [];

  return (
    <>
      <div className="px-2 sm:px-4 py-4 sm:py-6 md:px-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">
                All Games
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">
                Join existing games or create a new one
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={loadGames}
                disabled={loading}
                className="flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all border border-white/20 disabled:opacity-50 text-xs sm:text-sm"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => onTabChange?.("create")}
                className="flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all border border-white/20 text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Create Game</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {loading && games.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <>
              {/* Waiting Games (Always Visible) */}
              {waitingGames.length > 0 && (
                <GamesList 
                  games={waitingGames} 
                  loading={loading} 
                  onGameClick={handleGameClick} 
                />
              )}

              {/* My Active Games Section */}
              {myActiveGames.length > 0 && (
                <div className={waitingGames.length > 0 ? "mt-6 sm:mt-8" : ""}>
                  <button
                    onClick={() => setShowActiveGames(!showActiveGames)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
                  >
                    {showActiveGames ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <span className="text-lg sm:text-xl font-semibold">
                      My Active Games ({myActiveGames.length})
                    </span>
                  </button>

                  {showActiveGames && (
                    <GamesList 
                      games={myActiveGames} 
                      loading={false} 
                      onGameClick={handleGameClick} 
                    />
                  )}
                </div>
              )}

              {/* My Past Games Section */}
              {myPastGames.length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <button
                    onClick={() => setShowPastGames(!showPastGames)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
                  >
                    {showPastGames ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <span className="text-lg sm:text-xl font-semibold">
                      My Past Games ({myPastGames.length})
                    </span>
                  </button>

                  {showPastGames && (
                    <GamesList 
                      games={myPastGames} 
                      loading={false} 
                      onGameClick={handleGameClick} 
                    />
                  )}
                </div>
              )}

              {/* No games message */}
              {games.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-300 text-lg mb-4">No games available</div>
                  <button
                    onClick={() => onTabChange?.("create")}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all border border-white/20"
                  >
                    Create New Game
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedGameId !== null && (
        <GameModal
          gameId={selectedGameId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
