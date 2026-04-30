import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API_URL } from '@/lib/stacksConfig';
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '../lib/gameUtils';

// ============================================
// Player Data Hooks
// ============================================

/**
 * Fetch player data by address
 * Note: Contract currently doesn't have get-player function
 * This will return null until contract is updated
 */
export function usePlayerData(address?: string | null) {
  return useQuery({
    queryKey: ['player', address],
    queryFn: async (): Promise<Player | null> => {
      if (!address) return null;

      try {
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-player-stats',
          functionArgs: [standardPrincipalCV(address)],
          senderAddress: CONTRACT_ADDRESS,
        });

        const data = cvToValue(response);
        // get-player-stats returns (ok { wins: uint, total-earned: uint })
        // cvToValue returns { isOk: true, value: { wins: 0n, "total-earned": 0n } }
        if (!data || !data.value) {
           return {
            address,
            username: "",
            wins: 0,
            losses: 0,
            draws: 0,
            totalGames: 0,
            totalEarned: 0,
            registered: false,
          };
        }

        const stats = data?.value || {};
        const chainWins = Number(stats.wins?.value ?? stats.wins ?? 0);
        const chainEarned = Number(stats["total-earned"]?.value ?? stats["total-earned"] ?? 0);
        
        return {
          address,
          username: "",
          wins: chainWins,
          losses: 0, 
          draws: 0,
          totalGames: 0,
          totalEarned: chainEarned,
          registered: true,
        };
      } catch (error) {
        console.error('Error fetching player data:', error);
        return null;
      }
    },
    enabled: !!address,
    staleTime: 30000,
  });
}

// ============================================
// Leaderboard Hook
// ============================================

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
        const safeAddr = (val: any): string | null => {
          if (typeof val === 'string') return val;
          if (val?.value && typeof val.value === 'string') return val.value;
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
          const gameData = cvToValue(response);
          // (ok (some tuple)) -> { isOk: true, value: { ...tuple... } }
          if (gameData && typeof gameData === 'object' && 'value' in gameData) {
            const game = gameData.value;
            if (!game) return; // (some none) -> null
            
            const status = Number(game.status?.value ?? game.status ?? 0);
            
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
          const statsData = cvToValue(response);
          // (ok { ... }) -> { isOk: true, value: { ... } }
          const onChainStats = statsData?.value || statsData || {};
          console.log(`[Leaderboard Debug] Player ${playerAddresses[index]} stats:`, onChainStats);
          const localStats = playerStatsMap.get(playerAddresses[index])!;
          
          const chainWins = Number(onChainStats.wins || 0);
          const chainEarned = Number(onChainStats["total-earned"] || 0);

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

// ============================================
// Game Data Hooks
// ============================================

/**
 * Fetch latest game ID from contract
 */
export function useLatestGameId() {
  return useQuery({
    queryKey: ['latest-game-id'],
    queryFn: async (): Promise<number> => {
      try {
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-latest-game-id',
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS,
        });

        const data = cvToValue(response);
        // get-latest-game-id returns plain uint, cvToValue returns bigint directly
        const latestId = typeof data === 'bigint' ? Number(data) : Number(data?.value || 0);
        return latestId;
      } catch (error) {
        console.error('Error fetching latest game ID:', error);
        return 0;
      }
    },
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Fetch a single game by ID with polling for active games
 */
export function useGame(gameId: number, enablePolling = true) {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async (): Promise<Game | null> => {
      try {
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-game',
          functionArgs: [uintCV(gameId)],
          senderAddress: CONTRACT_ADDRESS,
        });

        const data = cvToValue(response);
        // (ok (some tuple)) -> { isOk: true, value: { ...tuple... } }
        if (!data || typeof data !== 'object' || !('value' in data) || !data.value) return null;

        const game = data.value;
        const safeVal = (v: any) => (typeof v === 'object' && v !== null && 'value' in v ? v.value : v);

        return {
          id: gameId,
          playerOne: safeVal(game['player-one']) || '',
          playerTwo: safeVal(game['player-two']) || null,
          betAmount: Number(safeVal(game['bet-amount']) || 0),
          boardSize: Number(safeVal(game['board-size']) || 3),
          isPlayerOneTurn: !!(safeVal(game['is-player-one-turn']) ?? true),
          winner: safeVal(game.winner) || null,
          lastMoveBlock: Number(safeVal(game['last-move-block']) || 0),
          status: Number(safeVal(game.status) || 0),
        };
      } catch (error) {
        console.error(`Error fetching game ${gameId}:`, error);
        return null;
      }
    },
    enabled: gameId >= 0,
    staleTime: 3000, // 3 seconds
    // Removed refetchInterval - only refresh manually or after mutations
  });
}

/**
 * Fetch list of recent games with polling
 */
export function useGameList(limit = 20) {
  const { data: latestGameId } = useLatestGameId();

  return useQuery({
    queryKey: ['games-list', limit],
    queryFn: async (): Promise<Game[]> => {
      try {
        const maxId = latestGameId || 0;
        if (maxId === 0) return [];

        const games: Game[] = [];
        const startId = Math.max(0, maxId - limit);
        
        const gamePromises = [];
        for (let i = maxId - 1; i >= startId && i >= 0; i--) {
          gamePromises.push(
            fetchCallReadOnlyFunction({
              network: NETWORK,
              contractAddress: CONTRACT_ADDRESS,
              contractName: CONTRACT_NAME,
              functionName: 'get-game',
              functionArgs: [uintCV(i)],
              senderAddress: CONTRACT_ADDRESS,
            })
          );
        }
        
        const responses = await Promise.all(gamePromises);
        responses.forEach((response, index) => {
          const gameId = maxId - 1 - index;
          const data = cvToValue(response);
          // (ok (some tuple)) -> { isOk: true, value: { ...tuple... } }
          if (data && typeof data === 'object' && 'value' in data && data.value) {
            const game = data.value;
            const safeVal = (v: any) => (typeof v === 'object' && v !== null && 'value' in v ? v.value : v);

            games.push({
              id: gameId,
              playerOne: safeVal(game['player-one']) || '',
              playerTwo: safeVal(game['player-two']) || null,
              betAmount: Number(safeVal(game['bet-amount']) || 0),
              boardSize: Number(safeVal(game['board-size']) || 3),
              isPlayerOneTurn: !!(safeVal(game['is-player-one-turn']) ?? true),
              winner: safeVal(game.winner) || null,
              lastMoveBlock: Number(safeVal(game['last-move-block']) || 0),
              status: Number(safeVal(game.status) || 0),
            });
          }
        });
        
        return games;
      } catch (error) {
        console.error('Error fetching game list:', error);
        return [];
      }
    },
    enabled: latestGameId !== undefined && latestGameId > 0,
    staleTime: 5000,
  });
}

// ============================================
// Board State Hook
// ============================================

/**
 * Fetch all board cells for a game
 */
export function useBoardState(gameId: number, boardSize: number) {
  return useQuery({
    queryKey: ['board-state', gameId],
    queryFn: async (): Promise<number[]> => {
      try {
        const maxCells = boardSize * boardSize;
        const cells: number[] = [];
        
        for (let i = 0; i < maxCells; i++) {
          const response = await fetchCallReadOnlyFunction({
            network: NETWORK,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-game-board-cell',
            functionArgs: [uintCV(gameId), uintCV(i)],
            senderAddress: CONTRACT_ADDRESS,
          });
          
          const data = cvToValue(response);
          cells.push(Number(data.value || 0));
        }
        
        return cells;
      } catch (error) {
        console.error(`Error fetching board state for game ${gameId}:`, error);
        return Array(boardSize * boardSize).fill(0);
      }
    },
    enabled: gameId >= 0 && boardSize > 0,
    staleTime: 3000, // 3 seconds
    // Removed refetchInterval - only refresh manually or after mutations
  });
}

// ============================================
// Time & Timeout Hooks
// ============================================

/**
 * Fetch move timeout from contract
 */
export function useMoveTimeout() {
  return useQuery({
    queryKey: ['move-timeout'],
    queryFn: async (): Promise<number> => {
      try {
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-move-timeout',
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS,
        });

        const data = cvToValue(response);
        return Number(data.value || 144); // Default 144 blocks (~24 hours)
      } catch (error) {
        console.error('Error fetching move timeout:', error);
        return 144;
      }
    },
    staleTime: 300000, // 5 minutes (timeout rarely changes)
  });
}

/**
 * Get current block height (simulated - in production, fetch from Stacks API)
 */
async function getCurrentBlockHeight(): Promise<number> {
  try {
    // Fetch current block height from Stacks API
    const response = await fetch(`${STACKS_API_URL}/v2/info`);
    const data = await response.json();
    return data.stacks_tip_height || 0;
  } catch (error) {
    console.error('Error fetching current block height:', error);
    return 0;
  }
}

/**
 * Calculate time remaining for a game move
 */
export function useTimeRemaining(gameId: number) {
  const { data: game } = useGame(gameId, false);
  const { data: moveTimeout } = useMoveTimeout();

  return useQuery({
    queryKey: ['time-remaining', gameId],
    queryFn: async (): Promise<number> => {
      if (!game || !moveTimeout) return 0;
      
      const currentBlock = await getCurrentBlockHeight();
      const timeoutBlock = game.lastMoveBlock + moveTimeout;
      const blocksRemaining = timeoutBlock - currentBlock;
      
      if (blocksRemaining <= 0) return 0;
      
      // Stacks blocks are ~10 minutes (600 seconds) on average
      const secondsRemaining = blocksRemaining * 600;
      return Math.max(0, secondsRemaining);
    },
    enabled: !!game && !!moveTimeout && isGameActive(game),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Update every 30 seconds (reduced from 10s)
  });
}

// ============================================
// Reward Hooks
// ============================================

/**
 * Fetch claimable reward for a game
 */
export function useClaimableReward(gameId: number) {
  return useQuery({
    queryKey: ['claimable-reward', gameId],
    queryFn: async (): Promise<number | null> => {
      try {
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-claimable-reward',
          functionArgs: [uintCV(gameId)],
          senderAddress: CONTRACT_ADDRESS,
        });

        const data = cvToValue(response);
        if (!data || typeof data !== 'object' || !('value' in data)) return null;
        
        // (ok (some uint)) -> { isOk: true, value: 100n }
        return data.value ? Number(data.value) : null;
      } catch (error) {
        console.error(`Error fetching claimable reward for game ${gameId}:`, error);
        return null;
      }
    },
    enabled: gameId >= 0,
    staleTime: 5000, // 5 seconds
  });
}

/**
 * Check if reward has been claimed for a game
 */
export function useRewardClaimed(gameId: number) {
  return useQuery({
    queryKey: ['reward-claimed', gameId],
    queryFn: async (): Promise<boolean> => {
      try {
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'is-reward-claimed',
          functionArgs: [uintCV(gameId)],
          senderAddress: CONTRACT_ADDRESS,
        });

        const data = cvToValue(response);
        return Boolean(data.value || false);
      } catch (error) {
        console.error(`Error checking reward claimed status for game ${gameId}:`, error);
        return false;
      }
    },
    enabled: gameId >= 0,
    staleTime: 5000, // 5 seconds
  });
}

// ============================================
// Query Invalidation Hook
// ============================================

/**
 * Hook to invalidate queries after transactions
 * Use this after createGame, joinGame, play, forfeitGame, claimReward
 */
export function useInvalidateGameQueries() {
  const queryClient = useQueryClient();
  
  return {
    // Invalidate specific game data
    invalidateGame: (gameId: number) => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['board-state', gameId] });
      queryClient.invalidateQueries({ queryKey: ['time-remaining', gameId] });
      queryClient.invalidateQueries({ queryKey: ['claimable-reward', gameId] });
      queryClient.invalidateQueries({ queryKey: ['reward-claimed', gameId] });
    },
    
    // Invalidate game list and latest ID
    invalidateGameList: () => {
      queryClient.invalidateQueries({ queryKey: ['games-list'] });
      queryClient.invalidateQueries({ queryKey: ['latest-game-id'] });
    },
    
    // Invalidate player data
    invalidatePlayer: (address: string) => {
      queryClient.invalidateQueries({ queryKey: ['player', address] });
    },
    
    // Invalidate leaderboard
    invalidateLeaderboard: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
    
    // Invalidate everything (use sparingly)
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },

    // Invalidate admin data
    invalidateAdmin: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  };
}

// ============================================
// Admin Hooks
// ============================================

export function useAdminData() {
  const { data: platformFee, isLoading: isLoadingFee } = useQuery({
    queryKey: ['admin', 'fee'],
    queryFn: async () => {
      try {
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-platform-fee',
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS,
        });
        const val = cvToValue(response);
        return Number(val.value || 0); // Assuming uint
      } catch (e) {
        console.error("Error fetching platform fee", e);
        return 0;
      }
    },
    staleTime: 60000,
  });

  const { data: moveTimeout, isLoading: isLoadingTimeout } = useQuery({
    queryKey: ['admin', 'timeout'],
    queryFn: async () => {
      try {
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-move-timeout',
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS,
        });
        const val = cvToValue(response);
        return Number(val.value || 144);
      } catch (e) {
         console.error("Error fetching move timeout", e);
         return 144;
      }
    },
    staleTime: 60000,
  });

  const { data: isPaused, isLoading: isLoadingPaused } = useQuery({
    queryKey: ['admin', 'paused'],
    queryFn: async () => {
      try {
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'is-contract-paused',
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS,
        });
        // Check if response is true bool
        // cvToValue returns boolean primitive for boolCV
        const val = cvToValue(response);
        return val.value === true;
      } catch (e) {
        console.error("Error fetching paused status", e);
        return false;
      }
    },
    staleTime: 10000,
  });

  return {
    platformFee,
    moveTimeout,
    isPaused,
    isLoading: isLoadingFee || isLoadingTimeout || isLoadingPaused,
  };
}
