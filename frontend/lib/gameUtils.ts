import { Game } from '@/types/game';

/**
 * Calculate time remaining in seconds based on block heights
 * @param lastMoveBlock - Block height of last move
 * @param moveTimeout - Timeout in blocks
 * @param currentBlock - Current block height
 * @returns Seconds remaining (0 if timeout passed)
 */
export function calculateTimeRemaining(
  lastMoveBlock: number,
  moveTimeout: number,
  currentBlock: number
): number {
  const timeoutBlock = lastMoveBlock + moveTimeout;
  const blocksRemaining = timeoutBlock - currentBlock;
  
  if (blocksRemaining <= 0) return 0;
  
  // Stacks blocks are ~10 minutes (600 seconds) on average
  const secondsRemaining = blocksRemaining * 600;
  return Math.max(0, secondsRemaining);
}

/**
 * Format seconds into human-readable time string
 * @param seconds - Total seconds
 * @returns Formatted string like "2h 30m" or "45m 20s" or "00:00:00"
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  // Format as HH:MM:SS
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get human-readable game status label
 * @param status - Status code from contract (0: Active, 1: Ended, 2: Forfeited)
 * @param playerTwo - Player two address (null if waiting)
 * @returns Status label
 */
export function getGameStatusLabel(status: number, playerTwo: string | null): string {
  if (status === 0 && !playerTwo) return 'Waiting';
  if (status === 0 && playerTwo) return 'Active';
  if (status === 1) return 'Ended';
  if (status === 2) return 'Forfeited';
  return 'Unknown';
}

/**
 * Check if a game can be forfeited due to timeout
 * @param lastMoveBlock - Block height of last move
 * @param moveTimeout - Timeout in blocks
 * @param currentBlock - Current block height
 * @returns True if timeout has passed
 */
export function canForfeitGame(
  lastMoveBlock: number,
  moveTimeout: number,
  currentBlock: number
): boolean {
  const timeoutBlock = lastMoveBlock + moveTimeout;
  return currentBlock >= timeoutBlock;
}

/**
 * Check if a game is in active state
 * @param game - Game object
 * @returns True if game is active (status 0 and has both players)
 */
export function isGameActive(game: Game): boolean {
  return game.status === 0 && game.playerTwo !== null;
}

/**
 * Check if a game is waiting for a second player
 * @param game - Game object
 * @returns True if game is waiting (status 0 and no player two)
 */
export function isGameWaiting(game: Game): boolean {
  return game.status === 0 && game.playerTwo === null;
}

/**
 * Check if a game is finished (ended or forfeited)
 * @param game - Game object
 * @returns True if game is finished
 */
export function isGameFinished(game: Game): boolean {
  return game.status === 1 || game.status === 2;
}

/**
 * Get the current player's turn address
 * @param game - Game object
 * @returns Address of player whose turn it is, or null if game not active
 */
export function getCurrentTurnPlayer(game: Game): string | null {
  if (!isGameActive(game)) return null;
  return game.isPlayerOneTurn ? game.playerOne : game.playerTwo;
}

/**
 * Check if it's a specific player's turn
 * @param game - Game object
 * @param playerAddress - Address to check
 * @returns True if it's this player's turn
 */
export function isPlayerTurn(game: Game, playerAddress: string): boolean {
  const currentPlayer = getCurrentTurnPlayer(game);
  return currentPlayer === playerAddress;
}

/**
 * Truncate Stacks address for display
 * @param address - Full Stacks address
 * @param startChars - Number of characters to show at start (default 6)
 * @param endChars - Number of characters to show at end (default 4)
 * @returns Truncated address like "SP1234...ABCD"
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
