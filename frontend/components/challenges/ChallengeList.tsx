"use client";

import { ChallengeCard } from "./ChallengeCard";
import { Loader2 } from "lucide-react";

interface Challenge {
  gameId: bigint;
  creator: string;
  betAmount: number;
  boardSize: number;
  createdAt: number;
  status: "open" | "accepted" | "expired";
}

interface ChallengeListProps {
  challenges: Challenge[];
  isLoading: boolean;
  onAccept: (gameId: bigint) => void;
  onCancel?: (gameId: bigint) => void;
}

export function ChallengeList({ challenges, isLoading, onAccept, onCancel }: ChallengeListProps) {
  if (isLoading) {
    return (
      \u003cdiv className="flex items-center justify-center py-12"\u003e
        \u003cLoader2 className="w-8 h-8 animate-spin text-blue-500" /\u003e
      \u003c/div\u003e
    );
  }

  if (challenges.length === 0) {
    return (
      \u003cdiv className="text-center py-12"\u003e
        \u003cp className="text-gray-400"\u003eNo open challenges available\u003c/p\u003e
        \u003cp className="text-sm text-gray-500 mt-2"\u003eCreate a challenge to get started!\u003c/p\u003e
      \u003c/div\u003e
    );
  }

  return (
    \u003cdiv className="grid gap-4"\u003e
      {challenges.map((challenge) => (
        \u003cChallengeCard
          key={challenge.gameId.toString()}
          challenge={challenge}
          onAccept={onAccept}
          onCancel={onCancel}
        /\u003e
      ))}
    \u003c/div\u003e
  );
}
