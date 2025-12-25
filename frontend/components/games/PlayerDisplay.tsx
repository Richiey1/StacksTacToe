"use client";

import { Users, Trophy } from "lucide-react";
import { usePlayerData } from "@/hooks/useGameData";

interface PlayerDisplayProps {
  playerAddress: string;
  isWinner?: boolean;
  isPlayer1?: boolean;
  isPlayer2?: boolean;
  showTrophy?: boolean;
  isFinishedGame?: boolean;
  isDraw?: boolean;
}

export function PlayerDisplay({
  playerAddress,
  isWinner = false,
  isPlayer1 = false,
  isPlayer2 = false,
  showTrophy = false,
  isFinishedGame = false,
  isDraw = false,
}: PlayerDisplayProps) {
  const { player } = usePlayerData(playerAddress);
  const username =
    player && typeof player === "object" && "username" in player
      ? (player.username as string)
      : null;

  // Color scheme based on BlocxTacToe:
  // Finished games: Winner = yellow (icon, address, username, trophy), Non-winner P1 = blue, Non-winner P2 = orange
  // Draw games: Icons keep colors (blue/orange), but address and username are white
  // Active/waiting games: Player 1 icon/address/username = blue, Player 2 icon/address/username = orange
  let iconColor = "text-white";
  let textColor = "text-white";
  let usernameColor = "text-white";
  let trophyColor = "text-yellow-400";

  if (isFinishedGame) {
    if (isDraw) {
      // Draw: Icons keep player colors, but address and username are white
      if (isPlayer1) {
        iconColor = "text-blue-400";
      } else if (isPlayer2) {
        iconColor = "text-orange-400";
      }
      textColor = "text-white";
      usernameColor = "text-white";
    } else if (isWinner) {
      // Winner: Everything yellow (icon, address, username, trophy)
      iconColor = "text-yellow-400";
      textColor = "text-yellow-400";
      usernameColor = "text-yellow-400";
      trophyColor = "text-yellow-400";
    } else {
      // Non-winner: Keep player colors
      if (isPlayer1) {
        // Player 1 = Blue icon, address, and username
        iconColor = "text-blue-400";
        textColor = "text-blue-400";
        usernameColor = "text-blue-400";
      } else if (isPlayer2) {
        // Player 2 = Orange icon, address, and username
        iconColor = "text-orange-400";
        textColor = "text-orange-400";
        usernameColor = "text-orange-400";
      }
    }
  } else {
    // Active/waiting games: Address and username match icon color
    if (isPlayer1) {
      // Player 1 (X) = Blue icon, address, and username
      iconColor = "text-blue-400";
      textColor = "text-blue-400";
      usernameColor = "text-blue-400";
    } else if (isPlayer2) {
      // Player 2 (O) = Orange icon, address, and username
      iconColor = "text-orange-400";
      textColor = "text-orange-400";
      usernameColor = "text-orange-400";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Users className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
      <div className="flex flex-col">
        <span className="text-gray-400 text-sm">
          Player {isPlayer1 ? "1" : "2"}:
        </span>
        <div className="flex items-center gap-1 flex-wrap">
          <span className={`font-mono text-xs ${textColor}`}>
            {playerAddress.slice(0, 6)}...{playerAddress.slice(-4)}
          </span>
          {username && (
            <span className={`${usernameColor} text-xs`}>({username})</span>
          )}
          {showTrophy && isWinner && (
            <>
              <span className="text-gray-500 mx-1">-</span>
              <Trophy className={`w-3 h-3 ${trophyColor}`} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
