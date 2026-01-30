"use client";

import { useState, useEffect, useCallback } from "react";
import { useStacks } from "@/contexts/StacksProvider";
import { GamesList, Game } from "@/components/games/GamesList";
import { GameModal } from "@/components/games/GameModal";
import { TabType } from "@/components/common/TabNavigation";
import { Plus, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { fetchCallReadOnlyFunction } from "@stacks/transactions";
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from "@/lib/stacksConfig";
import { cvToValue, uintCV } from "@stacks/transactions";

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
    const extractValue = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (val.value !== undefined) return extractValue(val.value);
      return String(val);
    };
    
    try {
      const result = await fetchCallReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-game",
        functionArgs: [uintCV(Number(gameId))],
        senderAddress: CONTRACT_ADDRESS,
      });

      const gameData = cvToValue(result);
      
      if (!gameData || !gameData.value) {
        return null;
      }

      const game = gameData.value;
      const gameFields = game.value;
      
      const playerOneRaw = gameFields["player-one"].value;
      const playerTwoRaw = gameFields["player-two"].value;
      const winnerRaw = gameFields.winner.value;
      
      const playerOne = extractValue(playerOneRaw);
      const playerTwo = extractValue(playerTwoRaw);
      const winner = extractValue(winnerRaw);
      
      const betAmount = BigInt(gameFields["bet-amount"].value);
      const status = Number(gameFields.status.value);
      const boardSize = Number(gameFields["board-size"].value || 3);
      const isPlayerOneTurn = gameFields["is-player-one-turn"].value;

      let gameStatus: "waiting" | "active" | "finished" = "waiting";
      if (status === 1 || status === 2) {
        gameStatus = "finished";
      } else if (playerTwo && playerTwo !== "none") {
        gameStatus = "active";
      }

      let timeRemaining: bigint | null = null;
      if (gameStatus === "active") {
        try {
          const timeResult = await fetchCallReadOnlyFunction({
            network: NETWORK,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-time-remaining",
            functionArgs: [uintCV(gameId)],
            senderAddress: CONTRACT_ADDRESS,
          });
          const timeValue = cvToValue(timeResult);
          timeRemaining = BigInt(timeValue || 0);
        } catch {
          // Ignore errors
        }
      }

      const gameObject = {
        id: gameId.toString(),
        gameId,
        player1: playerOne,
        player2: playerTwo && playerTwo !== "none" ? playerTwo : null,
        betAmount,
        status: gameStatus,
        currentPlayer: isPlayerOneTurn ? playerOne : playerTwo,
        winner: winner && winner !== "none" ? winner : null,
        createdAt: new Date(),
        timeRemaining,
        canForfeit: timeRemaining === BigInt(0),
        boardSize,
      } as Game;
      
      return gameObject;
    } catch (error) {
      console.error(`Failed to load game ${gameId}:`, error);
      return null;
    }
  }, []);


  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      const latestIdResult = await fetchCallReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-latest-game-id",
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
      });

      const latestIdData = cvToValue(latestIdResult);
      const gameCount = Number(latestIdData.value || 0);

      const allGames: Game[] = [];
      
      for (let i = 0; i < gameCount; i++) {
        const game = await loadGameData(BigInt(i));
        if (game) {
          allGames.push(game);
        }
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-10">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 font-pixel uppercase tracking-wider text-shadow">
                All Battles
              </h1>
              <p className="text-[10px] sm:text-xs font-pixel text-gray-400 uppercase tracking-tight">
                Enter the arena or deploy your own
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={loadGames}
                disabled={loading}
                className="btn-retro flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => onTabChange?.("create")}
                className="btn-retro flex items-center gap-2"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Create</span>
                <span className="sm:hidden text-[8px]">New</span>
              </button>
            </div>
          </div>

          {loading && games.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <>
              {waitingGames.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xs font-pixel text-gray-400 mb-6 uppercase tracking-widest border-b border-white/10 pb-2">Arena Lobby</h2>
                  <GamesList 
                    games={waitingGames} 
                    loading={loading} 
                    onGameClick={handleGameClick} 
                  />
                </div>
              )}

              {myActiveGames.length > 0 && (
                <div className="mb-10">
                  <button
                    onClick={() => setShowActiveGames(!showActiveGames)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-pixel"
                  >
                    {showActiveGames ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <span className="text-sm uppercase tracking-wider">
                      Active Battles ({myActiveGames.length})
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

              {myPastGames.length > 0 && (
                <div className="mb-10">
                  <button
                    onClick={() => setShowPastGames(!showPastGames)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-pixel"
                  >
                    {showPastGames ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <span className="text-sm uppercase tracking-wider">
                      History ({myPastGames.length})
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

              {games.length === 0 && !loading && (
                <div className="text-center py-20 border-4 border-dashed border-white/10">
                  <div className="text-gray-400 text-sm mb-6 font-pixel uppercase">The Arena is Empty</div>
                  <button
                    onClick={() => onTabChange?.("create")}
                    className="btn-retro"
                  >
                    Deploy First Battle
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
