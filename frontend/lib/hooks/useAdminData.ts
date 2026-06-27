import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API_URL } from '@/lib/constants/contracts';
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '@/lib/gameUtils';


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