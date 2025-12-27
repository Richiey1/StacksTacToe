"use client";

import { useReown } from "@/contexts/ReownProvider";
import { Smartphone } from "lucide-react";

export function WalletConnectButton() {
  const { open, isConnected, address } = useReown();

  return (
    <button
      onClick={() => open()}
      className="flex items-center gap-2 rounded-lg bg-orange-600/10 px-4 py-2 font-medium text-orange-500 transition-colors hover:bg-orange-600/20"
    >
      <Smartphone className="h-4 w-4" />
      <span>
        {isConnected && address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : "Mobile Connect"}
      </span>
    </button>
  );
}
