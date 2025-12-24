'use client'

import { Grid3x3, Plus, Trophy, Swords } from 'lucide-react';
import { TabType } from '@/app/page';

interface TabNavigationProps {
  activeTab: TabType | null;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'games' as TabType, label: 'Games', icon: Grid3x3 },
  { id: 'create' as TabType, label: 'Create', icon: Plus },
  { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: Trophy },
  { id: 'challenges' as TabType, label: 'Challenges', icon: Swords },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex justify-center">
      <div className="flex flex-wrap justify-center gap-2 glass rounded-lg p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-md 
                transition-all font-medium text-sm md:text-base
                ${isActive
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
