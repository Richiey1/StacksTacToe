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

export function useStacksTacToe() {
  const { address } = useStacks();

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
      },
    });
  }, [address]);

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
      },
    });
  }, [address]);

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
      },
    });
  }, [address]);

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
      },
    });
  }, [address]);

  return {
    registerPlayer,
    createGame,
    joinGame,
    playMove,
  };
}
