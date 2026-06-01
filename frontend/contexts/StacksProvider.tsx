'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  connect,
  disconnect,
  isConnected,
  getLocalStorage,
} from '@stacks/connect';

interface StacksContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

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

export function StacksProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // Hydrate on mount
  useEffect(() => {
    try {
      if (isConnected()) {
        const addr = readStxAddress();
        if (addr) {
          setAddress(addr);
          setConnected(true);
        }
      }
    } catch {
      // wallet not available
    }
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      const result = await connect();
      if (result?.addresses?.length) {
        const stxEntry =
          result.addresses.find((a) => a.address.startsWith('S')) ??
          result.addresses[0];
        if (stxEntry?.address) {
          setAddress(stxEntry.address);
          setConnected(true);
        }
      }
    } catch (e) {
      console.error('Connect error:', e);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    try {
      disconnect();
    } catch {
      // ignore
    }
    setAddress(null);
    setConnected(false);
  }, []);

  return (
    <StacksContext.Provider
      value={{
        isConnected: connected,
        address,
        connect: handleConnect,
        disconnect: handleDisconnect,
      }}
    >
      {children}
    </StacksContext.Provider>
  );
}

export const useStacks = () => {
  const context = useContext(StacksContext);
  if (!context) {
    throw new Error('useStacks must be used within StacksProvider');
  }
  return context;
};
