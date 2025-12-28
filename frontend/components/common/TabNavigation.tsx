"use client";

import { Gamepad2, PlusCircle, Trophy, Swords, Settings } from "lucide-react";

export type TabType = "games" | "create" | "leaderboard" | "challenges" | "admin";

interface TabNavigationProps {
  activeTab: TabType | null;
  onTabChange: (tab: TabType) => void;
  showAdmin?: boolean;
}

export function TabNavigation({ activeTab, onTabChange, showAdmin = false }: TabNavigationProps) {
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "create", label: "Create", icon: PlusCircle },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "challenges", label: "Challenges", icon: Swords },
  ];

  if (showAdmin) {
    tabs.push({ id: "admin", label: "Admin", icon: Settings });
  }

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
                ? "bg-gradient-to-br from-orange-500/20 to-orange-600/20 text-orange-400 border-2 border-orange-500/50"
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
