"use client";

import { useState } from "react";
import { Trophy, Clock, Users, Coins } from "lucide-react";
import { useStacks } from "@/contexts/StacksProvider";

interface Challenge {
  gameId: bigint;
  creator: string;
  betAmount: number;
  boardSize: number;
  createdAt: number;
  status: "open" | "accepted" | "expired";
}

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept: (gameId: bigint) => void;
  onCancel?: (gameId: bigint) => void;
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
    \u003cdiv className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"\u003e
      {/* Header */}
      \u003cdiv className="flex items-start justify-between mb-4"\u003e
        \u003cdiv className="flex items-center gap-3"\u003e
          \u003cdiv className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"\u003e
            \u003cTrophy className="w-6 h-6 text-white" /\u003e
          \u003c/div\u003e
          \u003cdiv\u003e
            \u003ch3 className="text-lg font-bold text-white"\u003e
              {isOwnChallenge ? "Your Challenge" : "Open Challenge"}
            \u003c/h3\u003e
            \u003cp className="text-sm text-gray-400"\u003e
              {challenge.creator.slice(0, 6)}...{challenge.creator.slice(-4)}
            \u003c/p\u003e
          \u003c/div\u003e
        \u003c/div\u003e

        {challenge.status === "open" && (
          \u003cspan className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full"\u003e
            Open
          \u003c/span\u003e
        )}
      \u003c/div\u003e

      {/* Details */}
      \u003cdiv className="grid grid-cols-2 gap-4 mb-4"\u003e
        \u003cdiv className="flex items-center gap-2"\u003e
          \u003cCoins className="w-4 h-4 text-orange-400" /\u003e
          \u003cdiv\u003e
            \u003cp className="text-xs text-gray-400"\u003eBet Amount\u003c/p\u003e
            \u003cp className="text-sm font-bold text-white"\u003e{betAmountSTX} STX\u003c/p\u003e
          \u003c/div\u003e
        \u003c/div\u003e

        \u003cdiv className="flex items-center gap-2"\u003e
          \u003cUsers className="w-4 h-4 text-blue-400" /\u003e
          \u003cdiv\u003e
            \u003cp className="text-xs text-gray-400"\u003eBoard Size\u003c/p\u003e
            \u003cp className="text-sm font-bold text-white"\u003e{challenge.boardSize}x{challenge.boardSize}\u003c/p\u003e
          \u003c/div\u003e
        \u003c/div\u003e
      \u003c/div\u003e

      {/* Actions */}
      \u003cdiv className="flex gap-2"\u003e
        {!isOwnChallenge && challenge.status === "open" && (
          \u003cbutton
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
          \u003e
            {isAccepting ? "Accepting..." : "Accept Challenge"}
          \u003c/button\u003e
        )}

        {isOwnChallenge && challenge.status === "open" && onCancel && (
          \u003cbutton
            onClick={() => onCancel(challenge.gameId)}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-all"
          \u003e
            Cancel Challenge
          \u003c/button\u003e
        )}

        {challenge.status === "accepted" && (
          \u003cdiv className="flex-1 text-center py-2 text-gray-400"\u003e
            Challenge Accepted
          \u003c/div\u003e
        )}
      \u003c/div\u003e
    \u003c/div\u003e
  );
}
