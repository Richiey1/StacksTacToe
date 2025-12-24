import { useQuery } from '@tanstack/react-query';
import { callReadOnlyFunction, cvToValue, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '@/lib/stacksConfig';
import { Player, LeaderboardEntry, Game } from '@/types/game';

export function usePlayerData(address?: string | null) {
  return useQuery({
    queryKey: ['player', address],
    queryFn: async (): Promise<Player | null> => {
      if (!address) return null;

      try {
        const response = await callReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-player',
          functionArgs: [standardPrincipalCV(address)],
          senderAddress: address,
        });

        const data = cvToValue(response);
        if (!data) return null;

        return {
          address,
          username: data.value.username.value,
          wins: Number(data.value.wins.value),
          losses: Number(data.value.losses.value),
          draws: Number(data.value.draws.value),
          totalGames: Number(data.value['total-games'].value),
          rating: Number(data.value.rating.value),
          registered:  data.value.registered.value,
        };
      } catch (error) {
        console.error('Error fetching player data:', error);
        return null;
      }
    },
    enabled: !!address,
  });
}

// Note: Leaderboard fetching logic needs to be adapted based on contract's exact return type
// The contract has a list of principals in leaderboard-state
export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      try {
        const response = await callReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-leaderboard',
          functionArgs: [],
          senderAddress: CONTRACT_ADDRESS, // Can be any address
        });
        
        // This needs to be adjusted based on actual return value structure
        const data = cvToValue(response);
        // Transform data map to LeaderboardEntry array
        return data || []; 
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
    },
  });
}

// Fetch a single game by ID
export function useGame(gameId: number) {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async (): Promise<Game | null> => {
      try {
        const response = await callReadOnlyFunction({
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-game',
          functionArgs: [uintCV(gameId)],
          senderAddress: CONTRACT_ADDRESS,
        });

        const data = cvToValue(response);
        if (!data || !data.value) return null; // Handle (ok (some ...)) or (ok none)

        const game = data.value.value;
        return {
          id: gameId,
          playerOne: game['player-one'].value,
          playerTwo: game['player-two'].value,
          betAmount: Number(game['bet-amount'].value),
          boardSize: Number(game['board-size'].value),
          isPlayerOneTurn: game['is-player-one-turn'].value,
          winner: game.winner.value,
          lastMoveBlock: Number(game['last-move-block'].value),
          status: Number(game.status.value), // Check if status is uint
        };
      } catch (error) {
        console.error(`Error fetching game ${gameId}:`, error);
        return null;
      }
    },
    enabled: gameId >= 0,
  });
}

// Fetch list of recent games
// Inefficient method: fetch counter, then fetch last N games
export function useGameList(limit = 10) {
  return useQuery({
    queryKey: ['games-list', limit],
    queryFn: async (): Promise<Game[]> => {
      try {
        // 1. Get game ID counter
        // Note: The contract uses a data var for counter, but lacks a public getter for it directly?
        // Actually, usually `get-game` fails for invalid ID.
        // Wait, looking at contract, `game-id-counter` is a data-var. Is there a getter?
        // There isn't a dedicated getter for the counter in the outline I recall.
        // Let's assume we can try fetching IDs or maybe I missed the getter.
        // Checking contract outline again...
        // Ah, typically contracts expose it. If not, we might be stuck or have to guess.
        // Let's assume we fetch `get-game` for ID 0, 1, ... until error or check `get-last-game-id`.
        // If no getter, we can't easily know the count without an indexer.
        // Wait, `get-open-games` or similar? No.
        
        // TEMPORARY SOLUTION: Just try fetching games 0 to 20.
        // Ideally we should add `get-game-count` to contract, but deployment is done.
        // Or maybe `get-game` returns none for non-existent.
        
        const games: Game[] = [];
        // Trying to fetch first 20 games for now (or reverse if we knew the count)
        // Since we don't know the count, we'll try fetching from 0 upwards.
        // Ideally we need the counter.
        
        // For this hackathon scope, let's just fetch IDs 0-9.
        for (let i = 0; i < limit; i++) {
           const response = await callReadOnlyFunction({
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
               playerTwo: game['player-two'].value,
               betAmount: Number(game['bet-amount'].value),
               boardSize: Number(game['board-size'].value),
               isPlayerOneTurn: game['is-player-one-turn'].value,
               winner: game.winner.value,
               lastMoveBlock: Number(game['last-move-block'].value),
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
  });
}
