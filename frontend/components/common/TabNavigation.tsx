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
    <div className="flex flex-col gap-2 w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left w-full
              ${isActive
                ? "bg-white/20 text-white border-l-4 border-white"
                : "bg-white/5 text-gray-400 border-l-4 border-transparent hover:bg-white/10 hover:text-white hover:border-white/30"
              }
            `}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-base">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
