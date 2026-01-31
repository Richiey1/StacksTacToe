import { useState, useEffect, useRef, useCallback } from "react";
import { useStacks } from "@/contexts/StacksProvider";
import { useQueryClient } from "@tanstack/react-query";
import { GameBoard, BoardState } from "@/components/games/GameBoard";
import { CountdownTimer } from "@/components/games/CountdownTimer";
import { ForfeitModal } from "@/components/games/ForfeitModal";
import { JoinGameModal } from "@/components/games/JoinGameModal";
import { useStacksTacToe } from "@/hooks/useStacksTacToe";
import { 
  useGame, 
  usePlayerData, 
  useBoardState, 
  useTimeRemaining, 
  useRewardClaimed,
  useMoveTimeout
} from "@/hooks/useGameData";
import { 
  canForfeitGame, 
  isGameActive, 
  formatTimeRemaining,
  formatStx
} from "@/lib/gameUtils";
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
  const gameIdNum = Number(gameId);

  // Get game data using hooks
  const { data: gameData, isLoading: isLoadingGame } = useGame(gameIdNum, isOpen);
  const game = gameData;
  const boardSize = game?.boardSize || 3;
  
  const extractValue = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (val.value !== undefined) return extractValue(val.value);
    return String(val);
  };
  
  const playerOne = game ? extractValue(game.playerOne) : '';
  const playerTwo = game?.playerTwo ? extractValue(game.playerTwo) : null;
  const winner = game?.winner ? extractValue(game.winner) : null;
  const betAmount = game?.betAmount || 0;
  
  const { data: boardData } = useBoardState(gameIdNum, boardSize);
  const { data: timeRemaining } = useTimeRemaining(gameIdNum);
  const { data: isRewardClaimed } = useRewardClaimed(gameIdNum);
  const { data: moveTimeout } = useMoveTimeout();

  const gameRef = useRef<HTMLDivElement>(null);

  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [canJoin, setCanJoin] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [canForfeit, setCanForfeit] = useState(false);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [selectedJoinMove, setSelectedJoinMove] = useState<number | null>(null);
  const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const board: BoardState = boardData 
    ? boardData.map(cell => cell === 0 ? null : (cell === 1 ? 'X' : 'O'))
    : Array(boardSize * boardSize).fill(null);

  const { data: player1Data } = usePlayerData(playerOne);
  const { data: player2Data } = usePlayerData(playerTwo);

  useEffect(() => {
    if (!isOpen) {
      setGameStatus("waiting");
      setCanJoin(false);
      setIsPlayerTurn(false);
      setCanForfeit(false);
      setSelectedJoinMove(null);
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

  useEffect(() => {
    if (!game || !address) return;

    let statusEnum: GameStatus = "waiting";
    if (game.status === 1 || game.status === 2 || winner) {
      statusEnum = "finished";
    } else if (game.playerTwo && game.playerTwo !== address) {
      statusEnum = "active";
    } else if (game.playerTwo) { 
      statusEnum = "active";
    }
    setGameStatus(statusEnum);

    if (statusEnum === "waiting" && address.toLowerCase() !== playerOne.toLowerCase()) {
      setCanJoin(true);
    } else {
      setCanJoin(false);
    }

    if (statusEnum === "active" && playerTwo) {
      const currentPlayer = game.isPlayerOneTurn ? playerOne : playerTwo;
      setIsPlayerTurn(address.toLowerCase() === currentPlayer.toLowerCase());
    } else {
      setIsPlayerTurn(false);
    }
    
    if (statusEnum === "active" && !isPlayerTurn && moveTimeout && game.lastMoveBlock > 0) {
      setCanForfeit(timeRemaining === 0);
    } else {
      setCanForfeit(false);
    }

  }, [game, address, isPlayerTurn, timeRemaining, moveTimeout]);

  const handleCellClick = async (index: number) => {
    if (!address) {
      toast.error("Connect wallet");
      return;
    }

    if (gameStatus === "waiting" && canJoin) {
      if (selectedJoinMove === null) {
        setSelectedJoinMove(index);
        return;
      }
      setShowJoinConfirmModal(true);
    } else if (gameStatus === "active" && isPlayerTurn) {
      if (board[index] !== null) {
        toast.error("Occupied");
        return;
      }
      try {
        setIsPending(true);
        await playMove(gameIdNum, index);
        toast.success("Move sent...");
      } catch (err: any) {
        toast.error(err?.message || "Error");
      } finally {
        setIsPending(false);
      }
    }
  };

  const handleForfeit = async () => {
    try {
      setIsPending(true);
      await forfeitGame(gameIdNum);
      setShowForfeitModal(false);
      toast.success("Forfeit sent...");
    } catch (err: any) {
      toast.error(err?.message || "Error");
    } finally {
      setIsPending(false);
    }
  };

  const handleClaimReward = async () => {
    try {
      if (isRewardClaimed) {
        toast.error("Already claimed");
        return;
      }
      setIsPending(true);
      await claimReward(Number(gameId));
      toast.success("Claimed!");
    } catch (err: any) {
      toast.error(err?.message || "Error");
    } finally {
      setIsPending(false);
    }
  };

  const handleConfirmJoin = async () => {
    if (selectedJoinMove === null) return;
    try {
      setShowJoinConfirmModal(false);
      setIsPending(true);
      const betAmount = Number(game!.betAmount) / 1_000_000;
      await joinGame(Number(gameId), selectedJoinMove, betAmount);
      setSelectedJoinMove(null);
      toast.success("Joining...");
    } catch (err: any) {
      toast.error(err?.message || "Error");
      setSelectedJoinMove(null);
    } finally {
      setIsPending(false);
    }
  };

  const getPlayerUsername = (playerAddress: string): string | null => {
    if (!playerAddress || !game) return null;
    const isPlayer1 = playerOne.toLowerCase() === playerAddress.toLowerCase();
    const playerData = isPlayer1 ? player1Data : player2Data;
    return playerData?.username as string || null;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["game", gameId.toString()] });
      await queryClient.refetchQueries({ queryKey: ["game", gameId.toString()] });
      toast.success("Refreshed!");
    } catch (error) {
      toast.error("Error");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (!isOpen) return null;

  if (isLoadingGame || !game) {
    return (
      <>
        <div className="fixed inset-0 bg-black/80 z-50" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="nes-container max-w-2xl w-full">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
        </div>
      </>
    );
  }

  const isPlayer1 = address?.toLowerCase() === playerOne.toLowerCase();
  const isPlayer2 = playerTwo && address?.toLowerCase() === playerTwo.toLowerCase();
  const betAmountSTX = Number(betAmount) / 1_000_000;
  const totalPot = playerTwo ? betAmountSTX * 2 : betAmountSTX;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50 transition-opacity" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div ref={gameRef} className="nes-container max-w-2xl w-full my-auto relative !p-6 sm:!p-10">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <button onClick={handleRefresh} disabled={isRefreshing} className="btn-retro !p-2">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button onClick={onClose} className="btn-retro !p-2">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 pt-12">
            <div className="border-4 border-white/10 bg-white/5 p-4 font-pixel text-center">
              <p className="text-[10px] text-gray-400 mb-2 uppercase">POT</p>
              <p className="text-orange-500 text-xs sm:text-sm">{formatStx(totalPot * 1_000_000)} STX</p>
            </div>
            <div className="border-4 border-white/10 bg-white/5 p-4 font-pixel text-center">
              <p className="text-[10px] text-gray-400 mb-2 uppercase">PLAYERS</p>
              <p className="text-white text-xs sm:text-sm">{playerTwo ? "2/2" : "1/2"}</p>
            </div>
            <div className="border-4 border-white/10 bg-white/5 p-4 font-pixel text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] text-gray-400 mb-2 uppercase">TIME</p>
              <p className={`text-xs sm:text-sm ${ (timeRemaining || 0) < 3600 && (timeRemaining || 0) > 0 ? "text-red-500" : "text-white"}`}>
                {gameStatus === "active" ? formatTimeRemaining(timeRemaining || 0) : "--:--"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className={`border-4 p-4 font-pixel ${isPlayer1 ? "border-orange-500 bg-orange-500/5" : "border-white/10 bg-white/5"}`}>
              <p className="text-[10px] text-gray-400 mb-2 uppercase">PLAYER 1 (X)</p>
              <p className="text-blue-400 text-[10px] truncate">
                {playerOne.slice(0, 6)}...{playerOne.slice(-4)}
              </p>
              {isPlayer1 && <span className="text-[10px] text-green-400 mt-2 block">YOU</span>}
            </div>
            {playerTwo ? (
              <div className={`border-4 p-4 font-pixel ${isPlayer2 ? "border-orange-500 bg-orange-500/5" : "border-white/10 bg-white/5"}`}>
                <p className="text-[10px] text-gray-400 mb-2 uppercase">PLAYER 2 (O)</p>
                <p className="text-orange-400 text-[10px] truncate">
                  {playerTwo.slice(0, 6)}...{playerTwo.slice(-4)}
                </p>
                {isPlayer2 && <span className="text-[10px] text-green-400 mt-2 block">YOU</span>}
              </div>
            ) : (
              <div className="border-4 border-white/5 bg-white/5 p-4 font-pixel text-center flex items-center justify-center">
                <p className="text-[10px] text-gray-500 uppercase">Waiting...</p>
              </div>
            )}
          </div>

          {gameStatus === "finished" && (!winner || winner === address) && (
            <div className="mb-8 p-4 border-4 border-blue-500 bg-blue-500/10 text-center font-pixel">
              <p className="text-blue-400 text-sm uppercase mb-2">DRAW!</p>
              <p className="text-blue-300 text-[8px]">Bets refunded.</p>
            </div>
          )}

          {gameStatus === "finished" && winner && (
            <div className={`mb-8 p-4 border-4 text-center font-pixel ${
              winner.toLowerCase() === address?.toLowerCase() ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
            }`}>
              <p className={`text-sm uppercase mb-4 ${ winner.toLowerCase() === address?.toLowerCase() ? "text-green-400" : "text-red-400" }`}>
                {winner.toLowerCase() === address?.toLowerCase() ? "VICTORY!" : "DEFEAT"}
              </p>
              {winner.toLowerCase() === address?.toLowerCase() && (
                <button onClick={handleClaimReward} disabled={isPending || isRewardClaimed} className="btn-retro !py-2 !text-[10px]">
                  {isRewardClaimed ? "CLAIMED" : "CLAIM REWARD"}
                </button>
              )}
            </div>
          )}

          {gameStatus === "waiting" && canJoin && (
            <div className="mb-8 p-4 border-4 border-orange-500 bg-orange-500/10 text-center font-pixel">
              <p className="text-orange-500 text-[10px] uppercase">Select a cell to join</p>
            </div>
          )}

          {gameStatus === "active" && isPlayerTurn && (
            <div className="mb-8 p-4 border-4 border-green-500 bg-green-500/10 text-center font-pixel animate-pulse">
              <p className="text-green-500 text-[10px] uppercase">YOUR TURN!</p>
            </div>
          )}

          <div className="mb-8 flex justify-center">
            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              disabled={gameStatus === "finished" || (gameStatus === "active" && !isPlayerTurn) || (gameStatus === "waiting" && !canJoin)}
              winner={winner ? (isPlayer1 ? "X" : "O") : null}
              winningCells={[]} 
              boardSize={boardSize}
            />
          </div>

          <div className="flex justify-center">
            {gameStatus === "active" && canForfeit && (
              <button onClick={() => setShowForfeitModal(true)} className="btn-retro !border-red-500 !text-red-500 !shadow-red-500">
                FORFEIT (TIMEOUT)
              </button>
            )}
          </div>
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
