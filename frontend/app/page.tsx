"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HeroCarousel } from "@/components/common/HeroCarousel";
import { TabNavigation } from "@/components/common/TabNavigation";
import { GamesContent } from "@/components/common/GamesContent";
import { CreateGameContent } from "@/components/common/CreateGameContent";
import { LeaderboardContent } from "@/components/common/LeaderboardContent";
import { PlayerProfileContent } from "@/components/common/PlayerProfileContent";
import { VerifyGameContent } from "@/components/common/VerifyGameContent";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { TabType } from "@/components/common/TabNavigation";
import { useStacks } from "@/contexts/StacksProvider";
import { CONTRACT_ADDRESS } from "@/lib/stacksConfig";
import { ADMIN_WALLETS } from "@/lib/constants/contracts";

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType | null>("games");
  const { address } = useStacks();
  const isAdmin = address ? ADMIN_WALLETS.includes(address) : false;
  
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
    <div className="min-h-screen flex flex-col items-center px-2 sm:px-4 pt-28 pb-12 relative overflow-hidden bg-game-pattern selection:bg-blue-500 selection:text-white">
      <div className="relative z-10 max-w-7xl w-full space-y-8">
        {/* Hero Carousel - Outer nes-container removed */}
        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-12">
          <HeroCarousel onTabChange={setActiveTab} />
        </div>

        {/* Sidebar + Content Layout */}
        <div className="flex flex-col md:flex-row gap-8 pb-24 md:pb-0">
          {/* Sidebar Navigation */}
          <aside className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t-4 border-orange-500 md:static md:w-64 md:flex-shrink-0 md:mt-4 md:border-t-0 md:bg-transparent md:z-10">
            <div className="relative overflow-hidden md:border-4 md:border-orange-500 md:bg-black md:shadow-[4px_4px_0px_0px_#fff] p-1.5 md:p-6">
              {/* Pixelated Pattern Overlay */}
              <div 
                className="absolute inset-0 bg-orange-600 hidden md:block"
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
              
              <div className="relative z-10 w-full">
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
                  {activeTab === "challenges" && <PlayerProfileContent />}
                  {activeTab === "verify" && <VerifyGameContent />}
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
