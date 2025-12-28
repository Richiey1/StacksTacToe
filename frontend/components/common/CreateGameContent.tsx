"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStacks } from "@/contexts/StacksProvider";
import { useStacksTacToe } from "@/hooks/useStacksTacToe";
import { Loader2, Coins, AlertCircle, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";
import { STACKS_API_URL } from "@/lib/stacksConfig";

export function CreateGameContent() {
  const [betAmount, setBetAmount] = useState("");
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [boardSize, setBoardSize] = useState<3 | 5>(3);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const { isConnected, address } = useStacks();
  const { createGame } = useStacksTacToe();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }
  }, [isConnected, router]);

  // Fetch STX balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      
      setLoadingBalance(true);
      try {
        const response = await fetch(`${STACKS_API_URL}/extended/v1/address/${address}/balances`);
        const data = await response.json();
        const stxBalance = parseInt(data.stx.balance) / 1_000_000; // Convert microSTX to STX
        setBalance(stxBalance);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!betAmount || parseFloat(betAmount) <= 0) {
      setError("Please enter a valid bet amount greater than 0");
      return;
    }

    if (selectedMove === null) {
      setError("Please select your first move");
      return;
    }

    try {
      setIsCreating(true);
      await createGame(parseFloat(betAmount), selectedMove, boardSize);
      toast.success("Game created successfully!");
      // Reset form
      setBetAmount("");
      setSelectedMove(null);
      setBoardSize(3);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create game";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create New Game</h1>
            <p className="text-gray-400">Set your bet amount and make your first move</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Board Size Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Board Size
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { size: 3, label: "Classic" },
                  { size: 5, label: "Advanced" }
                ] as const).map(({ size, label }) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setBoardSize(size)}
                    className={`
                      px-4 py-3 rounded-lg border-2 transition-all font-medium flex flex-col items-center gap-1
                      ${boardSize === size
                        ? "bg-orange-500/20 border-orange-500 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                      }
                    `}
                  >
                    <span className="text-lg font-bold">{size}×{size}</span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Amount */}
            <div>
              <label htmlFor="betAmount" className="block text-sm font-medium text-gray-300 mb-2">
                Bet Amount (STX)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <input
                  id="betAmount"
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.01"
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              {/* Wallet Balance */}
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Wallet className="w-4 h-4 text-gray-400" />
                {loadingBalance ? (
                  <span className="text-gray-400">Loading balance...</span>
                ) : balance !== null ? (
                  <span className="text-gray-400">
                    Wallet Balance: <span className="text-white font-medium">{balance.toFixed(6)} STX</span>
                  </span>
                ) : (
                  <span className="text-gray-400">Unable to load balance</span>
                )}
              </div>
              
              <p className="mt-2 text-xs text-gray-400">
                Both players must pay this amount. Winner takes all.
              </p>
            </div>

            {/* First Move Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Your First Move
              </label>
              <div className={`grid gap-2 ${boardSize === 3 ? 'grid-cols-3' : boardSize === 5 ? 'grid-cols-5' : 'grid-cols-7'}`}>
                {Array.from({ length: boardSize * boardSize }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedMove(index)}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg border-2 transition-all
                      ${selectedMove === index
                        ? "bg-white/20 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                      }
                    `}
                  >
                    <span className="text-xl font-bold text-blue-500">X</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Click a cell to place your first X move
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-all border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Game...
                </>
              ) : (
                "Create Game"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
