export interface Game {
  id: number;
  playerOne: string;
  playerTwo: string | null;
  betAmount: number;
  boardSize: number;
  isPlayerOneTurn: boolean;
  winner: string | null;
  lastMoveBlock: number;
  status: number; // 0: Waiting, 1: Active, 2: Ended
}

export interface Player {
  address: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  rating: number;
  registered: boolean;
}

export interface LeaderboardEntry {
  player: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
}
