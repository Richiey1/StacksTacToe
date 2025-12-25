"use client";

import { Gamepad2, PlusCircle, Trophy, Swords } from "lucide-react";

export type TabType = "games" | "create" | "leaderboard" | "challenges";

interface TabNavigationProps {
  activeTab: TabType | null;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "games" as const, label: "Games", icon: Gamepad2 },
    { id: "create" as const, label: "Create", icon: PlusCircle },
    { id: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
    { id: "challenges" as const, label: "Challenges", icon: Swords },
  ];

  return (
    <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap
              ${isActive
                ? "bg-white/20 text-white border-2 border-white/30"
                : "bg-white/5 text-gray-400 border-2 border-white/10 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
