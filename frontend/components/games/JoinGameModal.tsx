"use client";

import { X, Coins, AlertCircle } from "lucide-react";

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  betAmount: number;
  isLoading?: boolean;
}

export function JoinGameModal({
  isOpen,
  onClose,
  onConfirm,
  betAmount,
  isLoading = false,
}: JoinGameModalProps) {
  if (!isOpen) return null;

  // Convert microSTX to STX (1 STX = 1,000,000 microSTX)
  const playerBet = Number(betAmount) / 1_000_000;
  const totalPot = (Number(betAmount) * 2) / 1_000_000;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-[60]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 md:p-8 max-w-md w-full relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Confirm Join Game
              </h2>
              <p className="text-sm sm:text-base text-gray-400">
                Review the bet details before joining
              </p>
            </div>

            {/* Bet Details */}
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 mb-1 sm:mb-2">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Player 1's Bet</span>
                </div>
                <p className="text-white font-semibold text-base sm:text-lg">
                  {playerBet.toFixed(6)} STX
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 mb-1 sm:mb-2">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">You Will Bet</span>
                </div>
                <p className="text-white font-semibold text-base sm:text-lg">
                  {playerBet.toFixed(6)} STX
                </p>
              </div>

              <div className="bg-green-500/20 rounded-lg p-3 sm:p-4 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400 mb-1 sm:mb-2">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">Total Pot</span>
                </div>
                <p className="text-green-400 font-bold text-lg sm:text-xl">
                  {totalPot.toFixed(6)} STX
                </p>
                <p className="text-green-300/70 text-xs sm:text-sm mt-1">
                  Winner takes all
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 sm:gap-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 sm:p-4">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-xs sm:text-sm">
                <span className="font-semibold">{playerBet.toFixed(6)} STX</span> will be transferred from your account to join this game.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/20 transition-all disabled:opacity-50 text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg border border-green-500/30 transition-all disabled:opacity-50 text-sm sm:text-base font-medium"
              >
                {isLoading ? "Joining..." : "Confirm & Join"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
