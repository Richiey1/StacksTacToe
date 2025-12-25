"use client";

import { X, Trophy } from "lucide-react";

interface ForfeitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameId: string;
  isLoading?: boolean;
}

export function ForfeitModal({
  isOpen,
  onClose,
  onConfirm,
  gameId,
  isLoading = false,
}: ForfeitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
              <Trophy className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Claim Timeout Victory</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">
            Game <span className="font-mono text-white">#{gameId}</span>
          </p>
          
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              <strong className="text-orange-400">⏰ Opponent Timed Out!</strong>
            </p>
            <p className="text-gray-300 text-sm mt-2">
              Your opponent hasn't made their move within the allocated time. 
              You can claim victory and receive both players' bets as your reward.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium transition-all border border-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Claim Victory"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
