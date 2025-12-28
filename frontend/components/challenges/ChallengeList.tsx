"use client";

import { ChallengeCard } from "./ChallengeCard";
import { Loader2 } from "lucide-react";

interface Challenge {
  gameId: number;
  creator: string;
  betAmount: number;
  boardSize: number;
  createdAt: number;
  status: "open" | "accepted" | "expired";
}

interface ChallengeListProps {
  challenges: Challenge[];
  isLoading: boolean;
  onAccept: (gameId: number) => void;
  onCancel?: (gameId: number) => void;
}

export function ChallengeList({ challenges, isLoading, onAccept, onCancel }: ChallengeListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No open challenges available</p>
        <p className="text-sm text-gray-500 mt-2">Create a challenge to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.gameId.toString()}
          challenge={challenge}
          onAccept={onAccept}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
