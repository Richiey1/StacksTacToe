"use client";

import React from "react";

export const BoardSkeleton = () => (
  <div className="relative overflow-hidden aspect-square w-full max-w-[400px] mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4 grid grid-cols-3 grid-rows-3 gap-2">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="bg-zinc-800/50 rounded-lg animate-pulse" />
    ))}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
  </div>
);

export const GameListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col gap-4"
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-zinc-800 rounded-full animate-pulse" />
        </div>
        <div className="h-10 w-full bg-zinc-800/50 rounded-xl animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
    ))}
  </div>
);

export const LeaderboardSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="relative overflow-hidden bg-zinc-900/40 border border-zinc-800/30 p-4 rounded-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center font-bold text-xs" />
          <div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse" />
          <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
    ))}
  </div>
);
