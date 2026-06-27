import { useStacks } from "@/contexts/StacksProvider";
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from "@/lib/stacksConfig";
import { FUNCTION_NAMES } from "@/lib/constants/contracts";
import { openContractCall } from "@stacks/connect";
import { uintCV, principalCV, PostConditionMode, Pc } from "@stacks/transactions";
import { useCallback } from "react";
import { useInvalidateGameQueries } from "./useGameData";

export function useStacksTacToe() {
  const { address } = useStacks();
  const {
    invalidatePlayer,
    invalidateGameList,
    invalidateGame,
    invalidateLeaderboard,
  } = useInvalidateGameQueries();

  const createGame = useCallback(
    async (betAmount: number, moveIndex: number, boardSize: number) => {
      if (!address) return;

      // Convert STX amount to microSTX
      const amountMicroStx = Math.floor(betAmount * 1_000_000);

      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: FUNCTION_NAMES.CREATE_GAME,
        functionArgs: [
          uintCV(amountMicroStx),
          uintCV(moveIndex),
          uintCV(boardSize),
        ],
        postConditions: [
          Pc.principal(address).willSendEq(amountMicroStx).ustx()
        ],
        postConditionMode: PostConditionMode.Deny,
        onFinish: () => {
          // Invalidate game list after creating a game
          invalidateGameList();
        },
      });
    },
    [address, invalidateGameList],
  );

  const joinGame = useCallback(
    async (gameId: number, moveIndex: number, betAmount: number) => {
      if (!address) return;

      // Convert STX amount to microSTX (must match the game's bet amount)
      const amountMicroStx = Math.floor(betAmount * 1_000_000);

      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: FUNCTION_NAMES.JOIN_GAME,
        functionArgs: [uintCV(gameId), uintCV(moveIndex)],
        postConditions: [
          Pc.principal(address).willSendEq(amountMicroStx).ustx()
        ],
        postConditionMode: PostConditionMode.Deny,
        onFinish: () => {
          // Invalidate specific game and game list after joining
          invalidateGame(gameId);
          invalidateGameList();
        },
      });
    },
    [address, invalidateGame, invalidateGameList],
  );

  const playMove = useCallback(
    async (gameId: number, moveIndex: number) => {
      if (!address) return;

      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: FUNCTION_NAMES.PLAY,
        functionArgs: [uintCV(gameId), uintCV(moveIndex)],
        postConditionMode: PostConditionMode.Deny,
        onFinish: () => {
          // Invalidate game data after making a move
          invalidateGame(gameId);
        },
      });
    },
    [address, invalidateGame],
  );

  const forfeitGame = useCallback(
    async (gameId: number) => {
      if (!address) return;

      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: FUNCTION_NAMES.FORFEIT_GAME,
        functionArgs: [uintCV(gameId)],
        postConditionMode: PostConditionMode.Deny,
        onFinish: () => {
          // Invalidate game data and leaderboard after forfeit
          invalidateGame(gameId);
          invalidateGameList();
          invalidateLeaderboard();
        },
      });
    },
    [address, invalidateGame, invalidateGameList, invalidateLeaderboard],
  );

  const claimReward = useCallback(
    async (gameId: number) => {
      if (!address) return;

      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: FUNCTION_NAMES.CLAIM_REWARD,
        functionArgs: [uintCV(gameId)],
        postConditionMode: PostConditionMode.Deny,
        onFinish: () => {
          // Invalidate game data after claiming reward
          invalidateGame(gameId);
        },
      });
    },
    [address, invalidateGame],
  );

  const setPlatformFee = useCallback(
    async (feePercent: number) => {
      if (!address) return;

      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: FUNCTION_NAMES.SET_PLATFORM_FEE,
        functionArgs: [uintCV(feePercent)],
        postConditionMode: PostConditionMode.Deny,
        onFinish: () => {},
      });
    },
    [address],
  );

  const setMoveTimeout = useCallback(
    async (timeoutDetails: number) => {
      if (!address) return;

      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: FUNCTION_NAMES.SET_MOVE_TIMEOUT,
        functionArgs: [uintCV(timeoutDetails)],
        postConditionMode: PostConditionMode.Deny,
        onFinish: () => {},
      });
    },
    [address],
  );

  const pauseContract = useCallback(async () => {
    if (!address) return;

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: FUNCTION_NAMES.PAUSE_CONTRACT,
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      onFinish: () => {},
    });
  }, [address]);

  const unpauseContract = useCallback(async () => {
    if (!address) return;

    await openContractCall({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: FUNCTION_NAMES.UNPAUSE_CONTRACT,
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      onFinish: () => {},
    });
  }, [address]);

  return {
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
