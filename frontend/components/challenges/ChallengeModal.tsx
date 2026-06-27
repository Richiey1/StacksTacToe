import { useState } from "react";
import { X, Swords, Coins, Grid3x3, Wallet, AlertTriangle } from "lucide-react";
import { useStacks } from "@/contexts/StacksProvider";
import { useStacksTacToe } from "@/lib/hooks/useStacksTacToe";
import { useGameBalance } from "@/lib/hooks/useGameBalance";
import { toast } from "react-hot-toast";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChallengeModal({ isOpen, onClose }: ChallengeModalProps) {
  const { address } = useStacks();
  const { createGame } = useStacksTacToe();
  const { balanceSTX, maxBetSTX, isLoading: loadingBalance, exceedsBet } = useGameBalance();
  const [betAmount, setBetAmount] = useState("0.3");
  const [boardSize, setBoardSize] = useState<3 | 5>(3);
  const [firstMove, setFirstMove] = useState(4);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const betExceedsBalance = exceedsBet(betAmount);

  const handleCreate = async () => {
    const betFloat = parseFloat(betAmount);
    if (betFloat <= 0) {
      toast.error("Bet amount must be greater than 0 STX");
      return;
    }
    if (betExceedsBalance) {
      toast.error("Bet exceeds your wallet balance");
      return;
    }
    const betMicroSTX = betFloat * 1_000_000;
    setIsCreating(true);
    try {
      await createGame(betMicroSTX, firstMove, boardSize);
      toast.success("Challenge created!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create challenge");
    } finally {
      setIsCreating(false);
    }
  };

  // Update first move when board size changes
  const handleBoardSizeChange = (size: 3 | 5) => {
    setBoardSize(size);
    setFirstMove(size === 3 ? 4 : 12); // Center cell
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Swords className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create Challenge</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

          {/* Bet Amount */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-orange-400" />
                  Bet Amount (STX)
                </div>
              </label>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                {loadingBalance ? "..." : `${balanceSTX.toFixed(4)} STX`}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="0.001"
                step="0.001"
                className={`w-full bg-black/20 border ${betExceedsBalance ? "border-red-500" : "border-white/10"} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 pr-16`}
                placeholder="Enter bet amount"
              />
              <button
                type="button"
                onClick={() => setBetAmount(maxBetSTX)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-orange-500 hover:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded"
              >
                MAX
              </button>
            </div>
            {betAmount && !isNaN(parseFloat(betAmount)) && (
              <div className="flex justify-end text-[9px] text-gray-500 font-mono mt-1 pr-1">
                Raw: {Math.floor(parseFloat(betAmount) * 1e6).toLocaleString()} micro-STX
              </div>
            )}
            {betExceedsBalance && (
              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 animate-pulse font-medium">
                <AlertTriangle className="w-3 h-3" /> Exceeds wallet balance
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">Minimum: 0.001 STX</p>
          </div>

        {/* Board Size */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-orange-400" />
              Board Size
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleBoardSizeChange(3)}
              className={`p-4 rounded-lg border-2 transition-all ${
                boardSize === 3
                  ? "border-orange-500 bg-orange-500/20 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
              }`}
            >
              <div className="text-2xl font-bold">3x3</div>
              <div className="text-xs">Classic</div>
            </button>
            <button
              type="button"
              onClick={() => handleBoardSizeChange(5)}
              className={`p-4 rounded-lg border-2 transition-all ${
                boardSize === 5
                  ? "border-orange-500 bg-orange-500/20 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
              }`}
            >
              <div className="text-2xl font-bold">5x5</div>
              <div className="text-xs">Advanced</div>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Challenge Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Bet Amount:</span>
              <span className="text-white font-medium">{betAmount} STX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Pot:</span>
              <span className="text-white font-medium">{(parseFloat(betAmount) * 2).toFixed(1)} STX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Board:</span>
              <span className="text-white font-medium">{boardSize}x{boardSize}</span>
            </div>
          </div>
        </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !betAmount || betExceedsBalance}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Challenge"}
            </button>
          </div>
      </div>
    </div>
  );
}
