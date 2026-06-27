import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API_URL } from '@/lib/stacksConfig';
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '@/lib/gameUtils';


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