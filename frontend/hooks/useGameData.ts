import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '@/lib/stacksConfig'
;
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '@/lib/gameUtils';

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
          functionName: 'get-player',
          functionArgs: [standardPrincipalCV(address)],
          senderAddress: address,
        });

        const data = cvToValue(response);
        if (!data || !data.value) return null;

        return {
          address,
          username: data.value.username?.value || "",
          wins: Number(data.value.wins?.value || 0),
          losses: Number(data.value.losses?.value || 0),
          draws: Number(data.value.draws?.value || 0),
          totalGames: Number(data.value["total-games"]?.value || 0),
          rating: Number(data.value.rating?.value || 0),
          registered: Boolean(data.value.registered?.value),
        };
      } catch (error) {
        console.error('Error fetching player data:', error);
        return null;
      }
    },
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    retry: 1, // Only retry once for missing contract function
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
        const response = await fetchCallReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-leaderboard',
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS,
        });
        
        const data = cvToValue(response);
        return data || []; 
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
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
        return Number(data.value || 0);
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
        if (!data || !data.value) return null;

        const game = data.value.value;
        return {
          id: gameId,
          playerOne: game['player-one'].value,
          playerTwo: game['player-two']?.value || null,
          betAmount: Number(game['bet-amount'].value),
          boardSize: Number(game['board-size'].value),
          isPlayerOneTurn: game['is-player-one-turn'].value,
          winner: game.winner?.value || null,
          lastMoveBlock: Number(game['last-move-block']?.value || game['last-move-time']?.value || 0),
          status: Number(game.status.value),
        };
      } catch (error) {
        console.error(`Error fetching game ${gameId}:`, error);
        return null;
      }
    },
    enabled: gameId >= 0,
    staleTime: 3000, // 3 seconds
    refetchInterval: (data) => {
      // Poll every 5 seconds for active games, 30 seconds for others
      if (!enablePolling) return false;
      if (data && isGameActive(data)) return 5000;
      return 30000;
    },
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
        const games: Game[] = [];
        
        // Fetch games in reverse order (newest first)
        const startId = Math.max(0, maxId - limit);
        
        for (let i = maxId - 1; i >= startId && i >= 0; i--) {
          const response = await fetchCallReadOnlyFunction({
            network: NETWORK,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-game',
            functionArgs: [uintCV(i)],
            senderAddress: CONTRACT_ADDRESS,
          });
          
          const data = cvToValue(response);
          if (data && data.value && data.value.value) {
            const game = data.value.value;
            games.push({
              id: i,
              playerOne: game['player-one'].value,
              playerTwo: game['player-two']?.value || null,
              betAmount: Number(game['bet-amount'].value),
              boardSize: Number(game['board-size'].value),
              isPlayerOneTurn: game['is-player-one-turn'].value,
              winner: game.winner?.value || null,
              lastMoveBlock: Number(game['last-move-block']?.value || game['last-move-time']?.value || 0),
              status: Number(game.status.value),
            });
          }
        }
        
        return games;
      } catch (error) {
        console.error('Error fetching game list:', error);
        return [];
      }
    },
    enabled: latestGameId !== undefined && latestGameId > 0,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
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
    refetchInterval: (data, query) => {
      // Poll every 5 seconds for active games
      const game = query.state.data;
      return game ? 5000 : false;
    },
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
    // TODO: Fetch from Stacks API
    // For now, return a mock value
    // In production: fetch from https://api.mainnet.hiro.so/v2/info
    const response = await fetch(`${NETWORK.coreApiUrl}/v2/info`);
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
    refetchInterval: 10000, // Update every 10 seconds
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
        if (!data || !data.value) return null;
        
        return Number(data.value.value || 0);
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
  };
}
