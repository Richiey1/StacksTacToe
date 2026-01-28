"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useStacksWallet } from "@/hooks/useStacksWallet";
import { Copy, LogOut, Check, ChevronDown, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";

type WalletState = ReturnType<typeof useStacksWallet>;

const formatAddress = (address: string | null) => {
  if (!address) return "CONNECT WALLET";
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
      setIsDropdownOpen(false);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success("Disconnected");
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!isMounted) {
    return (
      <button
        type="button"
        disabled
        className="btn-retro disabled:opacity-60"
      >
        <span className="relative">LOADING...</span>
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <button
        type="button"
        onClick={handleConnect}
        disabled={!isReady}
        className="btn-retro disabled:cursor-not-allowed disabled:opacity-60"
      >
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
        className="btn-retro flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        <span className="text-[10px] sm:text-xs">{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-black border-4 border-white shadow-xl z-50">
          {/* Wallet Address */}
          <div className="px-4 py-3 border-b-2 border-white bg-gray-900">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-orange-500" />
              <p className="text-[10px] font-pixel text-orange-500 break-all">{address}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Copy Address */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-500 hover:text-black transition-colors text-left group"
            >
              {copied ? (
                <Check className="w-4 h-4 group-hover:text-black text-green-400" />
              ) : (
                <Copy className="w-4 h-4 group-hover:text-black text-white" />
              )}
              <span className="font-pixel text-[10px] uppercase text-white group-hover:text-black">
                {copied ? "COPIED!" : "COPY ADDRESS"}
              </span>
            </button>

            {/* Disconnect */}
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500 hover:text-black transition-colors text-left group"
            >
              <LogOut className="w-4 h-4 group-hover:text-black text-red-500" />
              <span className="font-pixel text-[10px] uppercase text-white group-hover:text-black">DISCONNECT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
