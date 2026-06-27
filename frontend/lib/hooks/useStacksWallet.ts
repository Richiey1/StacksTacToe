"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  connect,
  disconnect,
  isConnected,
  getLocalStorage,
} from "@stacks/connect";
import { STACKS_NETWORK } from "@/lib/constants/contracts";

export type Network = "mainnet" | "testnet" | "disconnected";

/** Pull the STX address from localStorage set by @stacks/connect v8 */
function readStxAddress(): string | null {
  try {
    const data = getLocalStorage();
    if (!data?.addresses?.stx?.length) return null;
    return data.addresses.stx[0].address ?? null;
  } catch {
    return null;
  }
}

export function useStacksWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Hydrate on mount — check if wallet is already connected via localStorage
  useEffect(() => {
    try {
      if (isConnected()) {
        const addr = readStxAddress();
        if (addr) {
          setAddress(addr);
          setIsSignedIn(true);
        }
      }
    } catch {
      // wallet not present or not connected
    } finally {
      setIsReady(true);
    }
  }, []);

  const handleConnect = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const result = await connect();
      if (result?.addresses?.length) {
        // v8 returns all addresses; pick the STX one (symbol 'STX' or first)
        const stxEntry =
          result.addresses.find((a) => a.address.startsWith("S")) ??
          result.addresses[0];
        if (stxEntry?.address) {
          setAddress(stxEntry.address);
          setIsSignedIn(true);
        }
      }
    } catch (e) {
      console.error("Wallet connect error:", e);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    try {
      disconnect();
    } catch {
      // ignore
    }
    setAddress(null);
    setIsSignedIn(false);
  }, []);

  const network: Network = useMemo(() => {
    if (!isSignedIn) return "disconnected";
    return STACKS_NETWORK === "mainnet" ? "mainnet" : "testnet";
  }, [isSignedIn]);

  return {
    address,
    connect: handleConnect,
    disconnect: handleDisconnect,
    isReady,
    isSignedIn,
    network,
  };
}
