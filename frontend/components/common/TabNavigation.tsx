"use client";

import { Gamepad2, PlusCircle, Crown, User, Settings, Search } from "lucide-react";

export type TabType = "games" | "create" | "leaderboard" | "challenges" | "verify" | "admin";

interface TabNavigationProps {
  activeTab: TabType | null;
  onTabChange: (tab: TabType) => void;
  showAdmin?: boolean;
}

export function TabNavigation({ activeTab, onTabChange, showAdmin = false }: TabNavigationProps) {
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "create", label: "Create", icon: PlusCircle },
    { id: "leaderboard", label: "Leaderboard", icon: Crown },
    { id: "challenges", label: "Players Profile", icon: User },
    { id: "verify", label: "Verify Game", icon: Search },
  ];

  if (showAdmin) {
    tabs.push({ id: "admin", label: "Admin", icon: Settings });
  }

  return (
    <div className="flex flex-row md:flex-col justify-around gap-1 sm:gap-2 md:gap-6 w-full p-1 sm:p-2 md:p-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex flex-1 md:flex-none flex-col md:flex-row items-center justify-center md:justify-start gap-1 sm:gap-2 md:gap-4 px-1 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-4 transition-all text-center md:text-left font-pixel uppercase text-[7px] sm:text-[9px] md:text-sm border-2 md:border-4 md:w-full
              ${isActive
                ? "bg-orange-500 text-black border-orange-500 shadow-none md:shadow-[4px_4px_0px_0px_#fff]"
                : "bg-black text-white border-zinc-800 hover:bg-white hover:text-black hover:border-white md:border-white md:hover:shadow-[4px_4px_0px_0px_#f97316]"
              }
            `}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
            <span className="truncate max-w-[48px] sm:max-w-none md:max-w-none">{tab.label}</span>
            {isActive && <span className="hidden md:inline animate-pulse">◄</span>}
          </button>
        );
      })}
    </div>
  );
}
