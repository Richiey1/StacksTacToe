"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useStacksWallet } from "@/hooks/useStacksWallet";
import { Copy, LogOut, Check, ChevronDown, Wallet } from "lucide-react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const label = useMemo(
    () => formatAddress(address ?? null),
    [address],
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleConnect = () => {
    if (!isSignedIn) {
      connect();
    }
  };

  const handleCopy = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
      setIsDropdownOpen(false);
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success("Wallet disconnected");
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Show loading state during SSR/hydration
  if (!isMounted) {
    return (
      <button
        type="button"
        disabled
        className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all duration-200 disabled:opacity-60"
      >
        <span className="relative">Connect Wallet</span>
      </button>
    );
  }

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
    <div className="relative" ref={dropdownRef}>
      {/* Connected Wallet Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-2 rounded-lg bg-orange-600/10 px-4 py-2 font-medium text-orange-500 transition-colors hover:bg-orange-600/20"
      >
        <Wallet className="h-4 w-4" />
        <span className="text-sm">{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-800/95 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden z-50">
          {/* Wallet Address */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-medium text-white">{label}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Copy Address */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-white">
                {copied ? "Copied!" : "Copy Address"}
              </span>
            </button>

            {/* Disconnect */}
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
