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
    \u003cdiv className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"\u003e
      \u003cdiv className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"\u003e
        {/* Header */}
        \u003cdiv className="flex items-center justify-between mb-6"\u003e
          \u003cdiv className="flex items-center gap-3"\u003e
            \u003cdiv className="p-2 bg-blue-500/20 rounded-lg"\u003e
              \u003cSwords className="w-6 h-6 text-blue-400" /\u003e
            \u003c/div\u003e
            \u003ch2 className="text-2xl font-bold text-white"\u003eCreate Challenge\u003c/h2\u003e
          \u003c/div\u003e
          \u003cbutton
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          \u003e
            \u003cX className="w-5 h-5 text-gray-400" /\u003e
          \u003c/button\u003e
        \u003c/div\u003e

        {/* Bet Amount */}
        \u003cdiv className="mb-6"\u003e
          \u003clabel className="block text-sm font-medium text-gray-300 mb-2"\u003e
            \u003cdiv className="flex items-center gap-2"\u003e
              \u003cCoins className="w-4 h-4 text-orange-400" /\u003e
              Bet Amount (STX)
            \u003c/div\u003e
          \u003c/label\u003e
          \u003cinput
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            min="0.1"
            step="0.1"
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter bet amount"
          /\u003e
          \u003cp className="text-xs text-gray-500 mt-2"\u003eMinimum: 0.1 STX\u003c/p\u003e
        \u003c/div\u003e

        {/* Board Size */}
        \u003cdiv className="mb-6"\u003e
          \u003clabel className="block text-sm font-medium text-gray-300 mb-3"\u003e
            \u003cdiv className="flex items-center gap-2"\u003e
              \u003cGrid3x3 className="w-4 h-4 text-blue-400" /\u003e
              Board Size
            \u003c/div\u003e
          \u003c/label\u003e
          \u003cdiv className="grid grid-cols-2 gap-3"\u003e
            \u003cbutton
              onClick={() => handleBoardSizeChange(3)}
              className={`p-4 rounded-lg border-2 transition-all $\{
                boardSize === 3
                  ? "border-blue-500 bg-blue-500/20 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
              }`}
            \u003e
              \u003cdiv className="text-2xl font-bold"\u003e3x3\u003c/div\u003e
              \u003cdiv className="text-xs"\u003eClassic\u003c/div\u003e
            \u003c/button\u003e
            \u003cbutton
              onClick={() => handleBoardSizeChange(5)}
              className={`p-4 rounded-lg border-2 transition-all $\{
                boardSize === 5
                  ? "border-blue-500 bg-blue-500/20 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
              }`}
            \u003e
              \u003cdiv className="text-2xl font-bold"\u003e5x5\u003c/div\u003e
              \u003cdiv className="text-xs"\u003eAdvanced\u003c/div\u003e
            \u003c/button\u003e
          \u003c/div\u003e
        \u003c/div\u003e

        {/* Summary */}
        \u003cdiv className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6"\u003e
          \u003ch3 className="text-sm font-medium text-gray-400 mb-2"\u003eChallenge Summary\u003c/h3\u003e
          \u003cdiv className="space-y-1 text-sm"\u003e
            \u003cdiv className="flex justify-between"\u003e
              \u003cspan className="text-gray-400"\u003eBet Amount:\u003c/span\u003e
              \u003cspan className="text-white font-medium"\u003e{betAmount} STX\u003c/span\u003e
            \u003c/div\u003e
            \u003cdiv className="flex justify-between"\u003e
              \u003cspan className="text-gray-400"\u003eTotal Pot:\u003c/span\u003e
              \u003cspan className="text-white font-medium"\u003e{(parseFloat(betAmount) * 2).toFixed(1)} STX\u003c/span\u003e
            \u003c/div\u003e
            \u003cdiv className="flex justify-between"\u003e
              \u003cspan className="text-gray-400"\u003eBoard:\u003c/span\u003e
              \u003cspan className="text-white font-medium"\u003e{boardSize}x{boardSize}\u003c/span\u003e
            \u003c/div\u003e
          \u003c/div\u003e
        \u003c/div\u003e

        {/* Actions */}
        \u003cdiv className="flex gap-3"\u003e
          \u003cbutton
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg font-medium transition-all"
          \u003e
            Cancel
          \u003c/button\u003e
          \u003cbutton
            onClick={handleCreate}
            disabled={isCreating || !betAmount}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
          \u003e
            {isCreating ? "Creating..." : "Create Challenge"}
          \u003c/button\u003e
        \u003c/div\u003e
      \u003c/div\u003e
    \u003c/div\u003e
  );
}
