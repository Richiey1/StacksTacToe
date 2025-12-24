'use client'

import { Trophy } from 'lucide-react';

export function LeaderboardContent() {
  return (
    <div className="glass rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
      </div>

      <div className="text-center py-12">
        <p className="text-gray-400">Leaderboard coming soon...</p>
      </div>
    </div>
  );
}
