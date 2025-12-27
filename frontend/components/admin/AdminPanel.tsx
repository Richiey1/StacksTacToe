"use client";

import { useState } from "react";
import { useStacks } from "@/contexts/StacksProvider";
import { useAdminData, useInvalidateGameQueries } from "@/hooks/useGameData";
import { useStacksTacToe } from "@/hooks/useStacksTacToe";
import { CONTRACT_ADDRESS } from "@/lib/stacksConfig";
import { Shield, Settings, Activity, AlertTriangle, Play, Pause, Save, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export function AdminPanel() {
  const { address } = useStacks();
  const { platformFee, moveTimeout, isPaused, isLoading } = useAdminData();
  const { setPlatformFee, setMoveTimeout, pauseContract, unpauseContract } = useStacksTacToe();
  const { invalidateAdmin } = useInvalidateGameQueries();

  const [feeInput, setFeeInput] = useState<string>("");
  const [timeoutInput, setTimeoutInput] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Check strict equality with contract address (case insensitive usually safe but Stacks addresses are case sensitive in some contexts, though typically standard format)
  const isAdmin = address && (address === CONTRACT_ADDRESS || address === "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"); // Fallback for devnet deployer if needed, but CONTRACT_ADDRESS is source of truth

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <Shield className="w-16 h-16 mb-4 opacity-50" />
        <p>Please connect your wallet to access admin panel</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-400">
        <AlertTriangle className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>You are not authorized to view this panel.</p>
        <p className="text-sm mt-2 opacity-60">Connected: {address}</p>
        <p className="text-sm opacity-60">Owner: {CONTRACT_ADDRESS}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const handleSetFee = async () => {
    const fee = parseInt(feeInput);
    if (isNaN(fee) || fee < 0 || fee > 1000) {
      toast.error("Fee must be between 0 and 1000 basis points (0-10%)");
      return;
    }
    setIsUpdating(true);
    try {
      await setPlatformFee(fee);
      toast.success("Link set fee transaction submitted");
    } catch (e: any) {
      toast.error(e.message || "Failed to set fee");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetTimeout = async () => {
    const timeout = parseInt(timeoutInput);
    if (isNaN(timeout) || timeout < 10) {
      toast.error("Timeout must be at least 10 blocks");
      return;
    }
    setIsUpdating(true);
    try {
      await setMoveTimeout(timeout);
      toast.success("Set timeout transaction submitted");
    } catch (e: any) {
      toast.error(e.message || "Failed to set timeout");
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePause = async () => {
    setIsUpdating(true);
    try {
      if (isPaused) {
        await unpauseContract();
        toast.success("Unpause transaction submitted");
      } else {
        await pauseContract();
        toast.success("Pause transaction submitted");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update contract status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="px-4 py-8 md:px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
          <Settings className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400">Manage game contract parameters</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Contract Status Banner */}
        <div className={`p-6 rounded-xl border ${isPaused ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} flex items-center justify-between`}>
          <div>
            <h3 className={`text-lg font-bold ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
              Contract is {isPaused ? 'PAUSED' : 'ACTIVE'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {isPaused 
                ? "No new games can be created or joined. Moves cannot be made." 
                : "Game operations are running normally."}
            </p>
          </div>
          <button
            onClick={togglePause}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              isPaused 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume Contract' : 'Pause Contract'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Platform Fee Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Platform Fee</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-1">Current Fee</div>
              <div className="text-2xl font-mono text-purple-400">
                {(platformFee || 0) / 100}% ({platformFee || 0} bps)
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Set New Fee (0-1000 bps)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={feeInput}
                    onChange={(e) => setFeeInput(e.target.value)}
                    placeholder="e.g. 250 for 2.5%"
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleSetFee}
                    disabled={isUpdating || !feeInput}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Max 10% (1000 basis points)</p>
              </div>
            </div>
          </div>

          {/* Move Timeout Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Move Timeout</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-1">Current Timeout</div>
              <div className="text-2xl font-mono text-blue-400">
                {moveTimeout || 0} Blocks
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Approx. {((moveTimeout || 0) * 10 / 60).toFixed(1)} hours
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Set New Timeout (blocks)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={timeoutInput}
                    onChange={(e) => setTimeoutInput(e.target.value)}
                    placeholder="e.g. 144"
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSetTimeout}
                    disabled={isUpdating || !timeoutInput}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">144 blocks ≈ 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
