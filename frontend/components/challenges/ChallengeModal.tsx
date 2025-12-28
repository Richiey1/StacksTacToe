"use client";

import { useState } from "react";
import { X, Swords, Coins, Grid3x3 } from "lucide-react";
import { useStacksTacToe } from "@/hooks/useStacksTacToe";
import { toast } from "react-hot-toast";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChallengeModal({ isOpen, onClose }: ChallengeModalProps) {
  const { createGame } = useStacksTacToe();
  const [betAmount, setBetAmount] = useState("1");
  const [boardSize, setBoardSize] = useState<3 | 5>(3);
  const [firstMove, setFirstMove] = useState(4); // Center cell for 3x3
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const betMicroSTX = parseFloat(betAmount) * 1_000_000;
    
    if (betMicroSTX < 100000) {
      toast.error("Minimum bet is 0.1 STX");
      return;
    }

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
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Swords className="w-6 h-6 text-blue-400" />
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-orange-400" />
              Bet Amount (STX)
            </div>
          </label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            min="0.1"
            step="0.1"
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter bet amount"
          />
          <p className="text-xs text-gray-500 mt-2">Minimum: 0.1 STX</p>
        </div>

        {/* Board Size */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-blue-400" />
              Board Size
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleBoardSizeChange(3)}
              className={`p-4 rounded-lg border-2 transition-all $\{
                boardSize === 3
                  ? "border-blue-500 bg-blue-500/20 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
              }`}
            >
              <div className="text-2xl font-bold">3x3</div>
              <div className="text-xs">Classic</div>
            </button>
            <button
              onClick={() => handleBoardSizeChange(5)}
              className={`p-4 rounded-lg border-2 transition-all $\{
                boardSize === 5
                  ? "border-blue-500 bg-blue-500/20 text-white"
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
            disabled={isCreating || !betAmount}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Challenge"}
          </button>
        </div>
      </div>
    </div>
  );
}
