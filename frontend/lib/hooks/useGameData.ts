import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCallReadOnlyFunction, cvToValue, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API_URL } from '@/lib/stacksConfig';
import { Player, LeaderboardEntry, Game } from '@/types/game';
import { isGameActive } from '@/lib/gameUtils';



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

        const data = cvToJSON(response);
        // (ok (some tuple)) -> { success: true, value: { ... } }
        if (!data || !data.success || !data.value) return null;

        let game = data.value;
        while (game && typeof game === 'object' && 'value' in game && !game['player-one']) {
          game = game.value;
        }
        if (!game || !game['player-one']) return null;

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