"use client";

import { Search, Filter } from "lucide-react";

interface LeaderboardFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: "wins" | "games" | "winRate";
  onSortChange: (value: "wins" | "games" | "winRate") => void;
}

export function LeaderboardFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
}: LeaderboardFiltersProps) {
  return (
    \u003cdiv className="flex flex-col sm:flex-row gap-4 mb-6"\u003e
      {/* Search */}
      \u003cdiv className="flex-1 relative"\u003e
        \u003cSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /\u003e
        \u003cinput
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by address..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        /\u003e
      \u003c/div\u003e

      {/* Sort */}
      \u003cdiv className="relative"\u003e
        \u003cFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" /\u003e
        \u003cselect
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "wins" | "games" | "winRate")}
          className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
        \u003e
          \u003coption value="wins"\u003eSort by Wins\u003c/option\u003e
          \u003coption value="games"\u003eSort by Games\u003c/option\u003e
          \u003coption value="winRate"\u003eSort by Win Rate\u003c/option\u003e
        \u003c/select\u003e
      \u003c/div\u003e
    \u003c/div\u003e
  );
}
