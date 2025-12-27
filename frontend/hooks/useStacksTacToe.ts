import { useStacks } from '@/contexts/StacksProvider';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '@/lib/stacksConfig';
import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  principalCV,
  stringAsciiCV,
  PostConditionMode,
} from '@stacks/transactions';
import { useCallback } from 'react';
import { useInvalidateGameQueries } from './useGameData';

export function useStacksTacToe() {
  const { address } = useStacks();
  const { invalidatePlayer, invalidateGameList, invalidateGame, invalidateLeaderboard } = useInvalidateGameQueries();

  const registerPlayer = useCallback(async (username: string) => {
    if (!address) return;
    
    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'register-player',
      functionArgs: [stringAsciiCV(username)],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
        // Invalidate player data and leaderboard after registration
        if (address) {
          invalidatePlayer(address);
          invalidateLeaderboard();
        }
      },
    });
  }, [address, invalidatePlayer, invalidateLeaderboard]);

  const createGame = useCallback(async (betAmount: number, moveIndex: number, boardSize: number) => {
    if (!address) return;

    // Convert STX amount to microSTX
    const amountMicroStx = Math.floor(betAmount * 1_000_000);

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-game',
      functionArgs: [
        uintCV(amountMicroStx),
        uintCV(moveIndex),
        uintCV(boardSize),
      ],
      postConditionMode: PostConditionMode.Allow, // Check this: STX transfer usually needs Allow or specific post conditions
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
        // Invalidate game list after creating a game
        invalidateGameList();
      },
    });
  }, [address, invalidateGameList]);

  const joinGame = useCallback(async (gameId: number, moveIndex: number, betAmount: number) => {
    if (!address) return;

    // Convert STX amount to microSTX (must match the game's bet amount)
    const amountMicroStx = Math.floor(betAmount * 1_000_000);

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'join-game',
      functionArgs: [
        uintCV(gameId),
        uintCV(moveIndex),
      ],
      postConditionMode: PostConditionMode.Allow, // Needs to transfer STX
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
        // Invalidate specific game and game list after joining
        invalidateGame(gameId);
        invalidateGameList();
      },
    });
  }, [address, invalidateGame, invalidateGameList]);

  const playMove = useCallback(async (gameId: number, moveIndex: number) => {
    if (!address) return;

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'play',
      functionArgs: [
        uintCV(gameId),
        uintCV(moveIndex),
      ],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
        // Invalidate game data after making a move
        invalidateGame(gameId);
      },
    });
  }, [address, invalidateGame]);

  const forfeitGame = useCallback(async (gameId: number) => {
    if (!address) return;

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'forfeit-game',
      functionArgs: [uintCV(gameId)],
      postConditionMode: PostConditionMode.Allow, // May transfer STX to winner
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
        // Invalidate game data and leaderboard after forfeit
        invalidateGame(gameId);
        invalidateGameList();
        invalidateLeaderboard();
      },
    });
  }, [address, invalidateGame, invalidateGameList, invalidateLeaderboard]);

  const claimReward = useCallback(async (gameId: number) => {
    if (!address) return;

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'claim-reward',
      functionArgs: [uintCV(gameId)],
      postConditionMode: PostConditionMode.Allow, // Transfers STX to winner
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
        // Invalidate game data after claiming reward
        invalidateGame(gameId);
      },
    });
  }, [address, invalidateGame]);

  const setPlatformFee = useCallback(async (feePercent: number) => {
    if (!address) return;

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'set-platform-fee',
      functionArgs: [uintCV(feePercent)],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
      },
    });
  }, [address]);

  const setMoveTimeout = useCallback(async (timeoutDetails: number) => {
    if (!address) return;

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'set-move-timeout',
      functionArgs: [uintCV(timeoutDetails)],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
      },
    });
  }, [address]);

  const pauseContract = useCallback(async () => {
    if (!address) return;

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'pause-contract',
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
      },
    });
  }, [address]);

  const unpauseContract = useCallback(async () => {
    if (!address) return;

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'unpause-contract',
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
      },
    });
  }, [address]);

  return {
    registerPlayer,
    createGame,
    joinGame,
    playMove,
    forfeitGame,
    claimReward,
    setPlatformFee,
    setMoveTimeout,
    pauseContract,
    unpauseContract,
  };
}
