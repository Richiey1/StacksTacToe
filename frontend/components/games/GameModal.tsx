"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStacks } from "@/contexts/StacksProvider";
import { useQueryClient } from "@tanstack/react-query";
import { GameBoard, BoardState, CellValue } from "@/components/games/GameBoard";
import { CountdownTimer } from "@/components/games/CountdownTimer";
import { ForfeitModal } from "@/components/games/ForfeitModal";
import { JoinGameModal } from "@/components/games/JoinGameModal";
import { useStacksTacToe } from "@/hooks/useStacksTacToe";
import { useGameData, usePlayerData } from "@/hooks/useGameData";
import { Loader2, Coins, Users, AlertCircle, Clock, X, Trophy, Share2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

type GameStatus = "waiting" | "active" | "finished";

interface GameModalProps {
  gameId: bigint;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ gameId, isOpen, onClose }: GameModalProps) {
  const { address } = useStacks();
  const { playMove, joinGame, forfeitGame, claimReward } = useStacksTacToe();
  const queryClient = useQueryClient();

  // Get game data using hook
  const { game, timeRemaining, isLoading: isLoadingGame } = useGameData(gameId);

  const gameRef = useRef<HTMLDivElement>(null);

  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [canJoin, setCanJoin] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [loadingGame, setLoadingGame] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [canForfeit, setCanForfeit] = useState(false);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [selectedJoinMove, setSelectedJoinMove] = useState<number | null>(null);
  const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [boardSize, setBoardSize] = useState<number>(3);
  const [isPending, setIsPending] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get player usernames
  const player1Address = game && typeof game === "object" && "playerOne" in game
    ? (game as { playerOne: string }).playerOne
    : undefined;

  const player2Address = game && typeof game === "object" && "playerTwo" in game
    ? (game as { playerTwo: string | null }).playerTwo
    : undefined;

  const { player: player1Data } = usePlayerData(player1Address || undefined);
  const { player: player2Data } = usePlayerData(player2Address || undefined);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setBoard(Array(9).fill(null));
      setGameStatus("waiting");
      setCanJoin(false);
      setIsPlayerTurn(false);
      setLoadingGame(true);
      setError(null);
      setWinningCells([]);
      setCanForfeit(false);
      setSelectedJoinMove(null);
      setBoardSize(3);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Update game state function
  const updateGameState = useCallback(() => {
    if (!game || !address || typeof game !== "object") return;
    if (!("playerOne" in game)) return;

    setLoadingGame(false);

    const { playerOne, playerTwo, status, winner, isPlayerOneTurn, boardSize: gameBoardSize } = game as {
      playerOne: string;
      playerTwo: string | null;
      status: number;
      winner: string | null;
      isPlayerOneTurn: boolean;
      boardSize: number;
    };

    // Set board size and initialize board if needed
    if (gameBoardSize) {
      setBoardSize(gameBoardSize);
      const maxCells = gameBoardSize * gameBoardSize;
      setBoard((prevBoard) => {
        if (prevBoard.length !== maxCells) {
          return Array(maxCells).fill(null);
        }
        return prevBoard;
      });
    }

    // Determine game status
    let statusEnum: GameStatus = "waiting";
    if (status === 1) { // Ended
      statusEnum = "finished";
    } else if (status === 2) { // Forfeited
      statusEnum = "finished";
    } else if (playerTwo && playerTwo !== address) {
      statusEnum = "active";
    }
    setGameStatus(statusEnum);

    // Check if player can join
    if (statusEnum === "waiting" && address.toLowerCase() !== playerOne.toLowerCase()) {
      setCanJoin(true);
    } else {
      setCanJoin(false);
    }

    // Check if it's player's turn
    if (statusEnum === "active" && playerTwo) {
      const currentPlayer = isPlayerOneTurn ? playerOne : playerTwo;
      setIsPlayerTurn(address.toLowerCase() === currentPlayer.toLowerCase());
    } else {
      setIsPlayerTurn(false);
    }
  }, [game, address]);

  // Fetch board data (simplified - in production, fetch from contract)
  const fetchBoardData = useCallback(async () => {
    if (!game || typeof game !== "object" || !("boardSize" in game)) return;

    const size = (game as { boardSize: number }).boardSize || 3;
    setBoardSize(size);
    const maxCells = size * size;

    // TODO: Fetch actual board data from contract using fetchCallReadOnlyFunction
    // For now, initialize empty board
    setBoard(Array(maxCells).fill(null));
  }, [game]);

  useEffect(() => {
    if (game && typeof game === "object" && "playerOne" in game) {
      updateGameState();
    }
  }, [updateGameState]);

  useEffect(() => {
    if (game && typeof game === "object" && "playerOne" in game && "boardSize" in game) {
      fetchBoardData();
    }
  }, [fetchBoardData]);

  // Poll for board updates during active games
  useEffect(() => {
    if (gameStatus === "active" && !isPlayerTurn && isOpen) {
      pollingIntervalRef.current = setInterval(() => {
        fetchBoardData();
        queryClient.invalidateQueries({ queryKey: ["game", gameId.toString()] });
      }, 5000);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [gameStatus, isPlayerTurn, isOpen, fetchBoardData, queryClient, gameId]);

  useEffect(() => {
    if (timeRemaining !== undefined) {
      setCanForfeit(timeRemaining === BigInt(0));
    }
  }, [timeRemaining]);

  const handleCellClick = async (index: number) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (gameStatus === "waiting" && canJoin) {
      // Join game - first select move, then show confirmation
      if (selectedJoinMove === null) {
        setSelectedJoinMove(index);
        return;
      }
      setShowJoinConfirmModal(true);
    } else if (gameStatus === "active" && isPlayerTurn) {
      // Make a move
      if (board[index] !== null) {
        toast.error("Cell is already occupied");
        return;
      }
      try {
        setIsPending(true);
        await playMove(Number(gameId), index);
        toast.success("Move submitted...");
      } catch (err: any) {
        toast.error(err?.message || "Failed to make move");
      } finally {
        setIsPending(false);
      }
    }
  };

  const handleForfeit = async () => {
    try {
      setIsPending(true);
      await forfeitGame(Number(gameId));
      setShowForfeitModal(false);
      toast.success("Forfeit transaction submitted...");
    } catch (err: any) {
      toast.error(err?.message || "Failed to forfeit game");
    } finally {
      setIsPending(false);
    }
  };

  const handleClaimReward = async () => {
    try {
      setIsPending(true);
      await claimReward(Number(gameId));
      toast.success("Reward claimed successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to claim reward");
    } finally {
      setIsPending(false);
    }
  };

  const handleConfirmJoin = async () => {
    if (selectedJoinMove === null) {
      toast.error("Please select a move");
      return;
    }
    if (!game || typeof game !== "object" || !("betAmount" in game)) {
      toast.error("Game data not loaded");
      return;
    }
    try {
      setShowJoinConfirmModal(false);
      setIsPending(true);
      const betAmount = Number((game as { betAmount: bigint }).betAmount) / 1_000_000;
      await joinGame(Number(gameId), selectedJoinMove, betAmount);
      setSelectedJoinMove(null);
      toast.success("Joining game...");
    } catch (err: any) {
      toast.error(err?.message || "Failed to join game");
      setSelectedJoinMove(null);
    } finally {
      setIsPending(false);
    }
  };

  const getPlayerUsername = (playerAddress: string): string | null => {
    if (!playerAddress || !game || typeof game !== "object" || !("playerOne" in game)) return null;

    const isPlayer1 = (game as { playerOne: string }).playerOne.toLowerCase() === playerAddress.toLowerCase();
    const playerData = isPlayer1 ? player1Data : player2Data;

    if (playerData && typeof playerData === "object" && "username" in playerData) {
      return playerData.username as string;
    }
    return null;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["game", gameId.toString()] });
      toast.success("Game data refreshed");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.success("Refreshing...");
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  // Show loading state
  if (loadingGame || isLoadingGame || !game || typeof game !== "object" || !("playerOne" in game)) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 sm:pt-4 overflow-y-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Safely extract game data
  const { playerOne, playerTwo, betAmount, winner } = game as {
    playerOne: string;
    playerTwo: string | null;
    betAmount: bigint;
    winner: string | null;
  };

  const isPlayer1 = address?.toLowerCase() === playerOne.toLowerCase();
  const isPlayer2 = playerTwo && address?.toLowerCase() === playerTwo.toLowerCase();

  // Convert microSTX to STX
  const betAmountSTX = Number(betAmount) / 1_000_000;
  const totalPot = playerTwo ? betAmountSTX * 2 : betAmountSTX;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-4 overflow-y-auto">
        <div ref={gameRef} className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl w-full my-auto relative">
          {/* Top Action Buttons */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 right-3 sm:right-4 flex justify-between items-start z-10">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 pt-10 sm:pt-12">
            {/* Bet Amount / Total */}
            <div className="bg-white/5 rounded-lg p-2 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 mb-0.5 sm:mb-1">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">
                  {playerTwo ? "Total Pot" : "Bet Amount"}
                </span>
              </div>
              <p className="text-white font-semibold text-sm sm:text-base md:text-lg">
                {totalPot.toFixed(6)} STX
              </p>
            </div>
            {/* Players */}
            <div className="bg-white/5 rounded-lg p-2 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 mb-0.5 sm:mb-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Players</span>
              </div>
              <p className="text-white font-semibold text-sm sm:text-base">
                {playerTwo ? "2/2" : "1/2"}
              </p>
            </div>
            {/* Time Remaining */}
            <div className="bg-white/5 rounded-lg p-2 sm:p-3 md:p-4 border border-white/10 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 mb-0.5 sm:mb-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Time Remaining</span>
              </div>
              {timeRemaining !== undefined && typeof timeRemaining === "bigint" && (
                <CountdownTimer timeRemaining={timeRemaining} />
              )}
            </div>
          </div>

          {/* Player Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <div className={`p-2 sm:p-3 md:p-4 rounded-lg border ${isPlayer1 ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10"}`}>
              <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Player 1 (X)</p>
              <p className="text-blue-400 font-mono text-xs sm:text-sm truncate">
                {playerOne.slice(0, 6)}...{playerOne.slice(-4)}
                {getPlayerUsername(playerOne) && (
                  <span className="text-blue-300 ml-1">({getPlayerUsername(playerOne)})</span>
                )}
              </p>
              {isPlayer1 && <span className="text-[10px] sm:text-xs text-green-400 mt-0.5 sm:mt-1 block">You</span>}
            </div>
            {playerTwo ? (
              <div className={`p-2 sm:p-3 md:p-4 rounded-lg border ${isPlayer2 ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10"}`}>
                <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Player 2 (O)</p>
                <p className="text-orange-400 font-mono text-xs sm:text-sm truncate">
                  {playerTwo.slice(0, 6)}...{playerTwo.slice(-4)}
                  {getPlayerUsername(playerTwo) && (
                    <span className="text-orange-300 ml-1">({getPlayerUsername(playerTwo)})</span>
                  )}
                </p>
                {isPlayer2 && <span className="text-[10px] sm:text-xs text-green-400 mt-0.5 sm:mt-1 block">You</span>}
              </div>
            ) : (
              <div className="p-2 sm:p-3 md:p-4 rounded-lg border border-white/10 bg-white/5">
                <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Player 2 (O)</p>
                <p className="text-gray-500 text-xs sm:text-sm">Waiting for player...</p>
              </div>
            )}
          </div>

          {/* Game Status Messages */}
          {gameStatus === "finished" && (!winner || winner === address) && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 font-semibold text-sm sm:text-base">
                🤝 Game Ended in a Draw
              </p>
              <p className="text-blue-300/80 text-xs sm:text-sm mt-1">
                No winner - your bet has been automatically refunded.
              </p>
            </div>
          )}

          {gameStatus === "finished" && winner && winner !== address && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border ${
              winner.toLowerCase() === address?.toLowerCase()
                ? "bg-green-500/20 border-green-500/30"
                : "bg-red-500/20 border-red-500/30"
            }`}>
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <p className={`font-semibold text-sm sm:text-base ${
                  winner.toLowerCase() === address?.toLowerCase()
                    ? "text-green-400"
                    : "text-red-400"
                }`}>
                  {winner.toLowerCase() === address?.toLowerCase()
                    ? "🎉 You Won!"
                    : "Game Over - You Lost"}
                </p>
                {winner.toLowerCase() === address?.toLowerCase() && (
                  <button
                    onClick={handleClaimReward}
                    disabled={isPending}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg border border-green-500/30 transition-all text-xs sm:text-sm disabled:opacity-50"
                  >
                    <Trophy className="w-4 h-4" />
                    Claim Reward
                  </button>
                )}
              </div>
            </div>
          )}

          {gameStatus === "waiting" && canJoin && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">Select your first move to join this game</p>
              {selectedJoinMove !== null && (
                <p className="text-xs sm:text-sm text-blue-300">Selected cell: {selectedJoinMove}</p>
              )}
            </div>
          )}

          {gameStatus === "active" && isPlayerTurn && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 font-semibold text-xs sm:text-sm md:text-base">Your turn! Make a move.</p>
            </div>
          )}

          {gameStatus === "active" && !isPlayerTurn && playerTwo && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg">
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">Waiting for opponent's move...</p>
            </div>
          )}

          {/* Game Board */}
          <div className="mb-4 sm:mb-6">
            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              disabled={gameStatus === "finished" || (gameStatus === "active" && !isPlayerTurn) || (gameStatus === "waiting" && !canJoin)}
              winner={winner ? (isPlayer1 ? "X" : "O") : null}
              winningCells={winningCells}
              boardSize={boardSize}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {gameStatus === "active" && canForfeit && (
              <button
                onClick={() => setShowForfeitModal(true)}
                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all text-xs sm:text-sm md:text-base"
              >
                Forfeit Game
              </button>
            )}
          </div>

          {error && (
            <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}
        </div>
      </div>

      <ForfeitModal
        isOpen={showForfeitModal}
        onClose={() => setShowForfeitModal(false)}
        onConfirm={handleForfeit}
        gameId={gameId.toString()}
        isLoading={isPending}
      />

      <JoinGameModal
        isOpen={showJoinConfirmModal}
        onClose={() => {
          setShowJoinConfirmModal(false);
          setSelectedJoinMove(null);
        }}
        onConfirm={handleConfirmJoin}
        betAmount={betAmount}
        isLoading={isPending}
      />
    </>
  );
}
