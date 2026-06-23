"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStacks } from "@/contexts/StacksProvider";
import { useStacksTacToe } from "@/hooks/useStacksTacToe";
import { useGameBalance } from "@/hooks/useGameBalance";
import { Loader2, Coins, AlertCircle, Wallet, Activity, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatStx } from "@/lib/gameUtils";

type SimState = "idle" | "simulating" | "broadcasting" | "confirmed";

export function CreateGameContent() {
  const [betAmount, setBetAmount] = useState("");
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [boardSize, setBoardSize] = useState<3 | 5>(3);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [simState, setSimState] = useState<SimState>("idle");

  const { isConnected, address } = useStacks();
  const { createGame } = useStacksTacToe();
  const { balanceSTX, maxBetSTX, isLoading: loadingBalance, exceedsBet } = useGameBalance();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const betExceedsBalance = exceedsBet(betAmount);

  // Step 1: Validate & open simulation modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!betAmount || parseFloat(betAmount) <= 0) {
      setError("Enter a valid bet amount");
      return;
    }
    if (betExceedsBalance) {
      setError("Bet amount exceeds your wallet balance");
      return;
    }
    if (selectedMove === null) {
      setError("Select your first move on the board");
      return;
    }

    // Open simulation preview
    setSimState("simulating");
  };

  // Step 2: User confirms → execute contract call
  const handleConfirm = async () => {
    if (selectedMove === null) return;
    setSimState("broadcasting");
    try {
      setIsCreating(true);
      await createGame(parseFloat(betAmount), selectedMove, boardSize);
      setSimState("confirmed");
      toast.success("Battle deployed!");
      setTimeout(() => {
        setSimState("idle");
        setBetAmount("");
        setSelectedMove(null);
        setBoardSize(3);
      }, 2000);
    } catch (err: any) {
      const msg = err?.message || "Failed to create game";
      setError(msg);
      toast.error(msg);
      setSimState("idle");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center py-8">
        <div className="max-w-xl w-full">
          <div className="p-4 sm:p-6">
            <div className="text-center mb-12 font-pixel text-shadow">
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 uppercase tracking-widest">Create Battle</h1>
              <p className="text-gray-300 text-sm sm:text-base uppercase tracking-tight">Set stakes and strike first</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Grid Size */}
              <div>
                <label className="block text-sm sm:text-base font-pixel text-gray-300 mb-5 uppercase tracking-wider">
                  Grid Size
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {([
                    { size: 3, label: "3x3 (Classic)" },
                    { size: 5, label: "5x5 (Advance)" }
                  ] as const).map(({ size, label }) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => { setBoardSize(size); setSelectedMove(null); }}
                      className={`
                        px-4 py-5 border-4 transition-all font-pixel uppercase text-xs
                        ${boardSize === size
                          ? "border-orange-500 bg-orange-500/10 text-white shadow-[2px_2px_0px_0px_#fff]"
                          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet Amount */}
              <div>
                <div className="flex justify-between items-center mb-5">
                  <label htmlFor="betAmount" className="text-sm sm:text-base font-pixel text-gray-300 uppercase tracking-wider">
                    Stakes (STX)
                  </label>
                  <span className="font-pixel text-[9px] text-gray-400 uppercase tracking-tight flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-orange-500" />
                    {loadingBalance ? "..." : `${balanceSTX.toFixed(4)} STX`}
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="betAmount"
                    type="number"
                    step="0.01"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="0.00"
                    className={`block w-full px-5 py-5 bg-black border-4 ${betExceedsBalance ? "border-red-500" : "border-white/20"} text-white font-pixel text-base focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-800 pr-20`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(maxBetSTX)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-pixel text-[9px] uppercase text-orange-500 hover:text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-1 transition-all"
                  >
                    MAX
                  </button>
                </div>
                {betAmount && !isNaN(parseFloat(betAmount)) && (
                  <div className="flex justify-end text-[9px] text-gray-500 font-pixel mt-2 pr-1">
                    Raw: {Math.floor(parseFloat(betAmount) * 1e6).toLocaleString()} micro-STX
                  </div>
                )}
                {betExceedsBalance && (
                  <p className="mt-2 font-pixel text-[9px] text-red-500 uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> Bet exceeds wallet balance
                  </p>
                )}
              </div>

              {/* First Move Board */}
              <div>
                <label className="block text-sm sm:text-base font-pixel text-gray-300 mb-5 uppercase tracking-wider">
                  Strike First
                </label>
                <div className={`grid gap-3 p-6 border-4 border-white/5 bg-white/5 ${boardSize === 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
                  {Array.from({ length: boardSize * boardSize }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedMove(index)}
                      className={`
                        aspect-square flex items-center justify-center border-2 transition-all
                        ${selectedMove === index
                          ? "bg-orange-500 border-white"
                          : "bg-black border-white/10 hover:border-white/40"
                        }
                      `}
                    >
                      <span className={`text-xl font-black ${selectedMove === index ? "text-white" : "text-blue-500/20"}`}>X</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 border-4 border-red-500 bg-red-500/10 text-red-500 font-pixel text-[10px] uppercase flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating || betExceedsBalance}
                className="btn-retro w-full py-6 !text-base disabled:opacity-40"
              >
                PREVIEW BATTLE
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Transaction Simulation Modal */}
      {simState !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-gray-950 border-4 border-orange-500 shadow-[6px_6px_0px_0px_#f97316] p-8 animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center font-pixel">

                {simState === "simulating" && (
                  <>
                    <div className="w-16 h-16 bg-orange-500/10 border-4 border-orange-500 flex items-center justify-center mb-6">
                      <Activity className="w-8 h-8 text-orange-500 animate-pulse" />
                    </div>
                    <h2 className="text-xl uppercase tracking-widest text-white mb-2">Confirm Battle</h2>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-8">
                      Review your battle configuration before signing
                    </p>

                    {/* Summary breakdown */}
                    <div className="w-full bg-black border-2 border-white/10 p-4 mb-8 text-left space-y-3">
                      <div className="flex justify-between text-[10px] uppercase tracking-wider">
                        <span className="text-gray-500">Your Stake</span>
                        <span className="text-white">{betAmount} STX</span>
                      </div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider">
                        <span className="text-gray-500">Total Pot</span>
                        <span className="text-orange-400">{(parseFloat(betAmount || "0") * 2).toFixed(4)} STX</span>
                      </div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider">
                        <span className="text-gray-500">Board Size</span>
                        <span className="text-white">{boardSize}×{boardSize}</span>
                      </div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider">
                        <span className="text-gray-500">First Move</span>
                        <span className="text-white">Cell #{(selectedMove ?? 0) + 1}</span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between text-[10px] uppercase tracking-wider">
                        <span className="text-gray-500">Est. Network Fee</span>
                        <span className="text-white">~0.002 STX</span>
                      </div>
                    </div>

                    <div className="flex gap-4 w-full">
                      <button
                        onClick={() => setSimState("idle")}
                        className="flex-1 py-3 border-4 border-white/20 bg-white/5 hover:bg-white/10 text-white text-[9px] uppercase font-pixel tracking-widest transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="flex-1 py-3 border-4 border-orange-500 bg-orange-500 hover:bg-orange-600 text-black text-[9px] uppercase font-pixel tracking-widest transition-all shadow-[4px_4px_0px_0px_#fff]"
                      >
                        Sign & Deploy
                      </button>
                    </div>
                  </>
                )}

                {simState === "broadcasting" && (
                  <>
                    <div className="w-16 h-16 bg-orange-500/10 border-4 border-orange-500 flex items-center justify-center mb-6">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                    <h2 className="text-xl uppercase tracking-widest text-white mb-2">Broadcasting</h2>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider">
                      Awaiting wallet signature...
                    </p>
                  </>
                )}

                {simState === "confirmed" && (
                  <>
                    <div className="w-16 h-16 bg-green-500/10 border-4 border-green-500 flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-xl uppercase tracking-widest text-green-400 mb-2">Battle Deployed!</h2>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider">
                      Your game is live on the Stacks blockchain
                    </p>
                  </>
                )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
