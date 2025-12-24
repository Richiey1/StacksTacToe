"use client";

import { useState } from "react";
import { HeroCarousel } from "@/components/common/HeroCarousel";
import { TabNavigation } from "@/components/common/TabNavigation";
import { GamesContent } from "@/components/common/GamesContent";
import { CreateGameContent } from "@/components/common/CreateGameContent";
import { LeaderboardContent } from "@/components/common/LeaderboardContent";
import { ChallengesContent } from "@/components/common/ChallengesContent";

export type TabType = "games" | "create" | "leaderboard" | "challenges";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType | null>("games");

  return (
    <div 
      className="min-h-screen flex flex-col items-center px-2 sm:px-4 pt-16 sm:pt-20 pb-8 sm:pb-12 md:pt-24 md:pb-20 relative overflow-hidden"
      style={{
        backgroundImage: `url('/stackstactoe-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Blur overlay with dark gradient */}
      <div 
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.85) 100%)',
        }}
      ></div>
      
      {/* Content with proper z-index */}
      <div className="relative z-10 max-w-6xl w-full space-y-6 sm:space-y-8 md:space-y-12">
        {/* Hero Carousel */}
        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-12">
          <HeroCarousel onTabChange={setActiveTab} />
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 sm:mt-6 md:mt-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab && (
          <div className="mt-4 sm:mt-6 md:mt-8">
            {activeTab === "games" && <GamesContent onTabChange={setActiveTab} />}
            {activeTab === "create" && <CreateGameContent />}
            {activeTab === "leaderboard" && <LeaderboardContent />}
            {activeTab === "challenges" && <ChallengesContent />}
          </div>
        )}
      </div>
    </div>
  );
}
