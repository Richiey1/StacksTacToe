import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API_URL } from '@/lib/stacksConfig';
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '@/lib/gameUtils';


export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      try {
        const latestResponse = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-latest-game-id',
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS,
        });
        const latestData = cvToValue(latestResponse);
        // get-latest-game-id returns plain uint, cvToValue returns bigint directly
        const latestId = typeof latestData === 'bigint' ? Number(latestData) : Number(latestData?.value || 0);

        if (latestId === 0) return [];

        const scanLimit = Math.max(0, latestId - 100);
        const safeAddr = (v: any): string | null => {
          if (v === null || v === undefined) return null;
          if (typeof v === 'string') {
            if (v === 'none') return null;
            return v;
          }
          if (typeof v === 'object') {
            if ('value' in v) return safeAddr(v.value);
            if (v.type === 'none') return null;
          }
          return null;
        };
        
        const gameResponses = [];
        const BATCH_SIZE = 5;
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (let i = latestId - 1; i >= scanLimit; i -= BATCH_SIZE) {
          const batch = [];
          for (let j = 0; j < BATCH_SIZE && i - j >= scanLimit; j++) {
            batch.push(
              fetchCallReadOnlyFunction({
                network: NETWORK,
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-game',
                functionArgs: [uintCV(i - j)],
                senderAddress: CONTRACT_ADDRESS,
              })
            );
          }
          const results = await Promise.all(batch);
          gameResponses.push(...results);
          if (i - BATCH_SIZE >= scanLimit) await sleep(100); // Small delay between batches
        }
        
        const playerStatsMap = new Map<string, { wins: number; losses: number; draws: number; totalEarned: number }>();
        
        gameResponses.forEach(response => {
          const gameData = cvToJSON(response);
          // (ok (some tuple)) -> { success: true, value: { ...tuple... } }
          if (gameData && gameData.success && gameData.value) {
            let game = gameData.value;
            while (game && typeof game === 'object' && 'value' in game && !game['player-one']) {
              game = game.value;
            }
            if (!game || !game['player-one']) return;
                               
            const safeVal = (v: any): any => {
              if (v === null || v === undefined) return null;
              if (typeof v === 'string') {
                if (v === 'none') return null;
                return v;
              }
              if (typeof v === 'object') {
                if ('value' in v) return safeVal(v.value);
                if (v.type === 'none') return null;
              }
              return v;
            };
            
            const status = Number(safeVal(game.status) || 0);
            
            if (status === 0) return;
            
            const p1 = safeAddr(game['player-one']);
            const p2 = safeAddr(game['player-two']);
            const winner = safeAddr(game.winner);
            
            if (!p1) return;
            
            if (!playerStatsMap.has(p1)) {
              playerStatsMap.set(p1, { wins: 0, losses: 0, draws: 0, totalEarned: 0 });
            }
            if (p2 && !playerStatsMap.has(p2)) {
              playerStatsMap.set(p2, { wins: 0, losses: 0, draws: 0, totalEarned: 0 });
            }
            
            if (status === 1 || status === 2) {
              if (!winner) {
                const p1Stats = playerStatsMap.get(p1)!;
                p1Stats.draws++;
                if (p2) {
                  const p2Stats = playerStatsMap.get(p2)!;
                  p2Stats.draws++;
                }
              } else if (winner === p1) {
                const p1Stats = playerStatsMap.get(p1)!;
                p1Stats.wins++;
                if (p2) {
                  const p2Stats = playerStatsMap.get(p2)!;
                  p2Stats.losses++;
                }
              } else if (winner === p2) {
                const p2Stats = playerStatsMap.get(p2)!;
                p2Stats.wins++;
                const p1Stats = playerStatsMap.get(p1)!;
                p1Stats.losses++;
              }
            }
          }
        });

        const playerAddresses = Array.from(playerStatsMap.keys());
        const statsPromises = playerAddresses.map(playerAddress => 
          fetchCallReadOnlyFunction({
            network: NETWORK,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-player-stats',
            functionArgs: [standardPrincipalCV(playerAddress)],
            senderAddress: CONTRACT_ADDRESS,
          })
        );

        const statsResponses = await Promise.all(statsPromises);

        const leaderboard = statsResponses.map((response, index) => {
          const statsData = cvToJSON(response);
          
          let onChainStats: any = {};
          if (statsData && statsData.success && statsData.value) {
            let data = statsData.value;
            while (data && typeof data === 'object' && 'value' in data && typeof data.wins === 'undefined') {
              data = data.value;
            }
            if (data && typeof data.wins !== 'undefined') {
              onChainStats = data;
            }
          }
          
          const safeVal = (v: any): any => {
            if (v === null || v === undefined) return null;
            if (typeof v === 'string') {
              if (v === 'none') return null;
              return v;
            }
            if (typeof v === 'object') {
              if ('value' in v) return safeVal(v.value);
              if (v.type === 'none') return null;
            }
            return v;
          };

          console.log(`[Leaderboard Debug] Player ${playerAddresses[index]} stats:`, onChainStats);
          const localStats = playerStatsMap.get(playerAddresses[index])!;
          
          const chainWins = Number(safeVal(onChainStats.wins) || 0);
          const chainEarned = Number(safeVal(onChainStats["total-earned"]) || 0);

          return {
            player: playerAddresses[index],
            username: "",
            wins: chainWins > 0 ? chainWins : localStats.wins,
            losses: localStats.losses,
            draws: localStats.draws,
            totalEarned: chainEarned,
          };
        });

        // Filter out players with no wins and sort
        return leaderboard
          .filter(p => p.wins > 0)
          .sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.totalEarned - a.totalEarned;
          });
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
    },
    staleTime: 60000,
  });
}