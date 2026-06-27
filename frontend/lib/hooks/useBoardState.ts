import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API_URL } from '@/lib/stacksConfig';
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '@/lib/gameUtils';


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