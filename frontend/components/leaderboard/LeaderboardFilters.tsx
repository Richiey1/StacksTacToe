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
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by address..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Sort */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "wins" | "games" | "winRate")}
          className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
        >
          <option value="wins">Sort by Wins</option>
          <option value="games">Sort by Games</option>
          <option value="winRate">Sort by Win Rate</option>
        </select>
      </div>
    </div>
  );
}
