"use client";

import { toast, Toaster as HotToaster, Toast } from "react-hot-toast";
import { CheckCircle2, AlertCircle, Swords, Trophy } from "lucide-react";

export const gameToast = {
  success: (message: string) =>
    toast.custom((t: Toast) => (
      <div
        className={`${
          t.visible
            ? "animate-in fade-in slide-in-from-right-full"
            : "animate-out fade-out slide-out-to-right-full"
        } max-w-md w-full bg-zinc-900 border-2 border-blue-500/30 shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden duration-300`}
      >
        <div className="flex-1 p-4 bg-gradient-to-r from-blue-500/5 to-transparent">
          <div className="flex items-start">
            <CheckCircle2 className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <p className="text-sm font-black text-white uppercase tracking-wider italic">
                Move Recorded
              </p>
              <p className="mt-1 text-sm text-zinc-400">{message}</p>
            </div>
          </div>
        </div>
      </div>
    )),
  error: (message: string) =>
    toast.custom((t: Toast) => (
      <div
        className={`${
          t.visible
            ? "animate-in fade-in slide-in-from-right-full"
            : "animate-out fade-out slide-out-to-right-full"
        } max-w-md w-full bg-zinc-900 border-2 border-red-500/30 shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden duration-300`}
      >
        <div className="flex-1 p-4 bg-gradient-to-r from-red-500/5 to-transparent">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <p className="text-sm font-black text-white uppercase tracking-wider italic">
                Invalid Move
              </p>
              <p className="mt-1 text-sm text-zinc-400">{message}</p>
            </div>
          </div>
        </div>
      </div>
    )),
  win: (amount: string) =>
    toast.custom(
      (t: Toast) => (
        <div
          className={`${
            t.visible
              ? "animate-in fade-in zoom-in"
              : "animate-out fade-out zoom-out"
          } max-w-md w-full bg-zinc-900 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] rounded-2xl pointer-events-auto flex overflow-hidden duration-500`}
        >
          <div className="flex-1 p-6 bg-gradient-to-b from-amber-500/10 to-transparent flex flex-col items-center text-center">
            <Trophy className="h-12 w-12 text-amber-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
              Victory!
            </h3>
            <p className="mt-2 text-zinc-300 font-medium">
              You&apos;ve claimed the prize pool of
            </p>
            <div className="mt-2 px-4 py-1 bg-amber-500 text-black font-black rounded-full text-lg">
              {amount} STX
            </div>
          </div>
        </div>
      ),
      { duration: 6000 },
    ),
  challenge: (player: string) =>
    toast.custom((t: Toast) => (
      <div
        className={`${
          t.visible
            ? "animate-in fade-in slide-in-from-top-full"
            : "animate-out fade-out slide-out-to-top-full"
        } max-w-sm w-full bg-zinc-900 border-2 border-blue-500 shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden duration-300`}
      >
        <div className="flex-1 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Swords className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-black text-blue-500 uppercase">
              New Challenge
            </p>
            <p className="mt-1 text-sm font-bold text-white truncate">
              {player} challenged you!
            </p>
          </div>
        </div>
      </div>
    )),
};

export const GameToaster = () => (
  <HotToaster
    position="top-center"
    toastOptions={{
      duration: 4000,
    }}
  />
);
