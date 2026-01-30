"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HeroCarousel } from "@/components/common/HeroCarousel";
import { TabNavigation } from "@/components/common/TabNavigation";
import { GamesContent } from "@/components/common/GamesContent";
import { CreateGameContent } from "@/components/common/CreateGameContent";
import { LeaderboardContent } from "@/components/common/LeaderboardContent";
import { ChallengesContent } from "@/components/common/ChallengesContent";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { TabType } from "@/components/common/TabNavigation";
import { useStacks } from "@/contexts/StacksProvider";
import { CONTRACT_ADDRESS } from "@/lib/stacksConfig";

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType | null>("games");
  const { address } = useStacks();
  const isAdmin = address && (address === CONTRACT_ADDRESS || address === "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
  
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
    <div className="min-h-screen flex flex-col items-center px-2 sm:px-4 pt-28 pb-12 relative overflow-hidden bg-game-pattern">
      <div className="relative z-10 max-w-7xl w-full space-y-8">
        {/* Hero Carousel - Outer nes-container removed */}
        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-12">
          <HeroCarousel onTabChange={setActiveTab} />
        </div>

        {/* Sidebar + Content Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:w-64 flex-shrink-0 md:mt-4">
            <div className="h-fit relative overflow-hidden border-4 border-orange-500 bg-black shadow-[4px_4px_0px_0px_#fff] p-6">
              {/* Pixelated Pattern Overlay */}
              <div 
                className="absolute inset-0 bg-orange-600"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
                    linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)
                  `,
                  backgroundSize: '4px 4px',
                  backgroundPosition: '0 0, 2px 2px',
                  opacity: 0.2
                }}
              ></div>
              
              <div className="relative z-10">
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} showAdmin={!!isAdmin} />
              </div>
            </div>
          </aside>

          {/* Main Content Area - Outer nes-container removed */}
          <main className="flex-1 min-w-0 md:mt-4">
            <div className="min-h-[500px]">
              {activeTab && (
                <>
                  {activeTab === "games" && <GamesContent onTabChange={setActiveTab} initialGameId={initialGameId} />}
                  {activeTab === "create" && <CreateGameContent />}
                  {activeTab === "leaderboard" && <LeaderboardContent />}
                  {activeTab === "challenges" && <ChallengesContent />}
                  {activeTab === "admin" && isAdmin && <AdminPanel />}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-game-dark" />}>
      <HomeContent />
    </Suspense>
  );
}
