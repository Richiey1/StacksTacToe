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
    <div className="flex flex-col gap-4 w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl font-medium transition-all w-full
              ${isActive
                ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-2 border-orange-400 shadow-lg shadow-orange-500/50"
                : "bg-white/5 text-gray-400 border-2 border-white/10 hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-orange-600/20 hover:text-orange-400 hover:border-orange-500/50"
              }
            `}
          >
            <Icon className="w-8 h-8" />
            <span className="text-sm font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
