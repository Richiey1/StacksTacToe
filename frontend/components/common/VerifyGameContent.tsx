"use client";

import { useState } from "react";
import { Search, Loader2, Gamepad2, Trophy } from "lucide-react";
import { fetchCallReadOnlyFunction, uintCV, cvToJSON, cvToValue } from "@stacks/transactions";
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from "@/lib/stacksConfig";
import Link from "next/link";

const STATUS_LABELS: Record<number, string> = {
  0: "ACTIVE",
  1: "ENDED",
  2: "FORFEITED",
};

export function VerifyGameContent() {
  const [gameId, setGameId] = useState("");
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const id = parseInt(gameId);
    if (isNaN(id) || id < 0) {
      setError("Enter a valid game ID (number)");
      return;
    }

    setLoading(true);
    setError("");
    setGame(null);

    try {
      const result = await fetchCallReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-game",
        functionArgs: [uintCV(id)],
        senderAddress: CONTRACT_ADDRESS,
      });
      
      const gameData = cvToJSON(result);
      console.log("[VerifyGame Debug] cvToJSON(result):", gameData);
      console.log("[VerifyGame Debug] raw result:", result);
      
      if (!gameData || !gameData.success || !gameData.value) {
        setError(`Game #${id} not found`);
        return;
      }

      // cvToJSON structure: { value: { value: { value: { 'player-one': ... } } } }
      // Navigate down to the tuple fields
      let data = gameData.value;
      while (data && typeof data === 'object' && 'value' in data && !data['player-one']) {
        data = data.value;
      }

      const safeVal = (v: any): any => {
        if (v === null || v === undefined) return null;
        if (typeof v === 'string') {
          if (v === 'none') return null;
          return v;
        }
        if (typeof v === 'object') {
          if ('value' in v) return safeVal(v.value);
          if (v.type === 'none') return null;
        }
        return v;
      };

      setGame({
        id,
        playerOne: safeVal(data["player-one"]) || "Unknown",
        playerTwo: safeVal(data["player-two"]) || null,
        betAmount: Number(safeVal(data["bet-amount"]) || 0),
        boardSize: Number(safeVal(data["board-size"]) || 3),
        status: Number(safeVal(data.status) || 0),
        isPlayerOneTurn: !!(safeVal(data["is-player-one-turn"]) ?? true),
        moveCount: Number(safeVal(data["move-count"]) || 0),
        winner: safeVal(data.winner) || null,
      });
    } catch (e: any) {
      setError(`Failed to fetch game: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-lg md:text-xl text-white uppercase tracking-wider border-b-4 border-orange-500 pb-3">
        Verify Game Status
      </h2>

      <p className="text-gray-400 text-sm">
        Enter a game ID to check its current status, players, and board size before joining or playing.
      </p>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="number"
          min="0"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          placeholder="Enter Game ID (e.g. 42)"
          className="flex-1 bg-black border-4 border-white text-white font-pixel text-sm px-4 py-3 focus:border-orange-500 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !gameId}
          className="flex items-center gap-2 bg-orange-500 text-black font-pixel text-sm px-6 py-3 border-4 border-orange-500 hover:bg-orange-400 disabled:opacity-40 shadow-[4px_4px_0px_0px_#fff] transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          CHECK
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border-4 border-red-500 text-red-400 font-pixel text-xs p-4">
          {error}
        </div>
      )}

      {/* Game Details */}
      {game && (
        <div className="border-4 border-orange-500 bg-black p-6 space-y-4 shadow-[4px_4px_0px_0px_#fff]">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-xl text-orange-500">GAME #{game.id}</h3>
            <span className={`font-pixel text-xs px-3 py-1 border-2 ${
              game.status === 0 ? "border-green-500 text-green-400" :
              game.status === 1 ? "border-gray-500 text-gray-400" :
              "border-red-500 text-red-400"
            }`}>
              {STATUS_LABELS[game.status] ?? "UNKNOWN"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-pixel text-xs uppercase">Player 1 (X)</p>
              <p className="text-white font-mono text-xs">{game.playerOne.slice(0, 20)}...</p>
            </div>
            <div>
              <p className="text-gray-500 font-pixel text-xs uppercase">Player 2 (O)</p>
              <p className="text-white font-mono text-xs">
                {game.playerTwo ? `${game.playerTwo.slice(0, 20)}...` : "Waiting for opponent"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-pixel text-xs uppercase">Board Size</p>
              <p className="text-orange-500 font-pixel">{game.boardSize}x{game.boardSize}</p>
            </div>
            <div>
              <p className="text-gray-500 font-pixel text-xs uppercase">Bet Amount</p>
              <p className="text-orange-500 font-pixel">{game.betAmount} uSTX</p>
            </div>
            <div>
              <p className="text-gray-500 font-pixel text-xs uppercase">Moves Made</p>
              <p className="text-white font-pixel">{game.moveCount}</p>
            </div>
            <div>
              <p className="text-gray-500 font-pixel text-xs uppercase">Current Turn</p>
              <p className="text-white font-pixel">{game.isPlayerOneTurn ? "Player 1 (X)" : "Player 2 (O)"}</p>
            </div>
          </div>

          {game.winner && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500 p-3 text-yellow-400 font-pixel text-xs">
              <Trophy className="w-4 h-4 inline mr-2" />
              Winner: {game.winner.slice(0, 20)}...
            </div>
          )}

          <Link
            href={`/?gameId=${game.id}`}
            className="flex items-center gap-2 bg-orange-500 text-black font-pixel text-sm px-6 py-3 border-4 border-orange-500 hover:bg-orange-400 shadow-[4px_4px_0px_0px_#fff] transition-all w-full justify-center"
          >
            <Gamepad2 className="w-4 h-4" />
            PLAY THIS GAME
          </Link>
        </div>
      )}

      {/* Latest Game ID hint */}
      <div className="text-gray-600 font-pixel text-xs">
        <p>Tip: Check the contract to find the latest game ID, then enter it above to see its status.</p>
      </div>
    </div>
  );
}


