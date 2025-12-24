'use client'

import { Swords } from 'lucide-react';

export function ChallengesContent() {
  return (
    <div className="glass rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Swords className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-white">Challenges</h2>
      </div>

      <div className="text-center py-12">
        <p className="text-gray-400">Challenges coming soon...</p>
      </div>
    </div>
  );
}
