"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HeroCarousel } from "@/components/common/HeroCarousel";
import { TabNavigation } from "@/components/common/TabNavigation";
import { GamesContent } from "@/components/common/GamesContent";
import { CreateGameContent } from "@/components/common/CreateGameContent";
import { LeaderboardContent } from "@/components/common/LeaderboardContent";
import { ChallengesContent } from "@/components/common/ChallengesContent";

export type TabType = "games" | "create" | "leaderboard" | "challenges";

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType | null>("games");
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId');
  const [initialGameId, setInitialGameId] = useState<bigint | null>(null);

  useEffect(() => {
    if (gameIdParam) {
      try {
        setInitialGameId(BigInt(gameIdParam));
        setActiveTab("games");
      } catch (e) {
        console.error("Invalid game ID param");
      }
    }
  }, [gameIdParam]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center px-2 sm:px-4 pt-16 sm:pt-20 pb-8 sm:pb-12 md:pt-24 md:pb-20 relative overflow-hidden"
      style={{
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
      <div className="relative z-10 max-w-7xl w-full space-y-6 sm:space-y-8">
        {/* Hero Carousel */}
        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-12">
          <HeroCarousel onTabChange={setActiveTab} />
        </div>

        {/* Sidebar + Content Layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab && (
              <>
                {activeTab === "games" && <GamesContent onTabChange={setActiveTab} initialGameId={initialGameId} />}
                {activeTab === "create" && <CreateGameContent />}
                {activeTab === "leaderboard" && <LeaderboardContent />}
                {activeTab === "challenges" && <ChallengesContent />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeContent />
    </Suspense>
  );
}
