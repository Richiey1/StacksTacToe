import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API_URL } from '@/lib/stacksConfig';
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '@/lib/gameUtils';


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