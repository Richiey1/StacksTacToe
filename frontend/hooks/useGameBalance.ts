"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useStacks } from "@/contexts/StacksProvider";
import { STACKS_API_URL } from "@/lib/stacksConfig";

export function useGameBalance() {
  const { address, isConnected } = useStacks();
  const [rawBalance, setRawBalance] = useState<number>(0); // in microSTX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${STACKS_API_URL}/extended/v1/address/${address}/balances`);
      const data = await res.json();
      const micro = parseInt(data?.stx?.balance || "0");
      setRawBalance(micro);
    } catch {
      setError("Could not fetch balance");
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    } else {
      setRawBalance(0);
    }
  }, [isConnected, address, fetchBalance]);

  // STX value with 6 decimal places
  const balanceSTX = useMemo(() => rawBalance / 1_000_000, [rawBalance]);

  // Safe max bet: full balance minus a small fee buffer (0.01 STX)
  const maxBetSTX = useMemo(() => Math.max(0, balanceSTX - 0.01).toFixed(6), [balanceSTX]);

  // Validation helper
  const exceedsBet = useCallback(
    (amount: string) => {
      const parsed = parseFloat(amount || "0");
      return rawBalance > 0 && parsed > balanceSTX;
    },
    [rawBalance, balanceSTX]
  );

  return {
    rawBalance,
    balanceSTX,
    maxBetSTX,
    isLoading,
    error,
    fetchBalance,
    exceedsBet,
  };
}
