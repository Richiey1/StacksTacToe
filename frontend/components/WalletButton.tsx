"use client";

import { useMemo, useState } from "react";
import { useStacksWallet } from "@/hooks/useStacksWallet";
import { Copy, LogOut, Check } from "lucide-react";
import { toast } from "react-hot-toast";

type WalletState = ReturnType<typeof useStacksWallet>;

const formatAddress = (address: string | null) => {
  if (!address) return "Connect Wallet";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

type Props = {
  wallet?: WalletState;
};

export function WalletButton({ wallet }: Props) {
  const walletState = wallet ?? useStacksWallet();
  const { address, connect, disconnect, isReady, isSignedIn } = walletState;
  const [copied, setCopied] = useState(false);

  const label = useMemo(
    () => formatAddress(address ?? null),
    [address],
  );

  const handleConnect = () => {
    if (!isSignedIn) {
      connect();
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    disconnect();
    toast.success("Wallet disconnected");
  };

  if (!isSignedIn) {
    return (
      <button
        type="button"
        onClick={handleConnect}
        disabled={!isReady}
        className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all duration-200 hover:shadow-amber-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <span className="relative">{label}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Connected Address Display */}
      <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
        <span className="text-sm font-medium text-white">{label}</span>
        
        {/* Copy Address Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          )}
        </button>
        
        {/* Disconnect Button */}
        <button
          type="button"
          onClick={handleDisconnect}
          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors group"
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </div>
  );
}
