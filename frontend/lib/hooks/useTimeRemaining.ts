import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API_URL } from '@/lib/constants/contracts';
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '@/lib/gameUtils';

import { useGame } from './useGameData';

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