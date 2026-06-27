import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API_URL } from '@/lib/stacksConfig';
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '@/lib/gameUtils';


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