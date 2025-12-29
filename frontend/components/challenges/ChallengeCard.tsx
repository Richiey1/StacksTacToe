"use client";

import { useState } from "react";
import { Trophy, Clock, Users, Coins } from "lucide-react";
import { useStacks } from "@/contexts/StacksProvider";

interface Challenge {
  gameId: number;
  creator: string;
  betAmount: number;
  boardSize: number;
  createdAt: number;
  status: "open" | "accepted" | "expired";
}

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept: (gameId: number) => void;
  onCancel?: (gameId: number) => void;
}

export function ChallengeCard({ challenge, onAccept, onCancel }: ChallengeCardProps) {
  const { address } = useStacks();
  const [isAccepting, setIsAccepting] = useState(false);

  const isOwnChallenge = address?.toLowerCase() === challenge.creator.toLowerCase();
  const betAmountSTX = challenge.betAmount / 1_000_000;

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(challenge.gameId);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isOwnChallenge ? "Your Challenge" : "Open Challenge"}
            </h3>
            <p className="text-sm text-gray-400">
              {challenge.creator.slice(0, 6)}...{challenge.creator.slice(-4)}
            </p>
          </div>
        </div>

        {challenge.status === "open" && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
            Open
          </span>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-orange-400" />
          <div>
            <p className="text-xs text-gray-400">Bet Amount</p>
            <p className="text-sm font-bold text-white">{betAmountSTX} STX</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-xs text-gray-400">Board Size</p>
            <p className="text-sm font-bold text-white">{challenge.boardSize}x{challenge.boardSize}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isOwnChallenge && challenge.status === "open" && (
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {isAccepting ? "Accepting..." : "Accept Challenge"}
          </button>
        )}

        {isOwnChallenge && challenge.status === "open" && onCancel && (
          <button
            onClick={() => onCancel(challenge.gameId)}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-all"
          >
            Cancel Challenge
          </button>
        )}

        {challenge.status === "accepted" && (
          <div className="flex-1 text-center py-2 text-gray-400">
            Challenge Accepted
          </div>
        )}
      </div>
    </div>
  );
}
