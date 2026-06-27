// Contract configuration
export const STACKS_NETWORK = 'mainnet'; // 'mainnet' or 'testnet'
export const CONTRACT_ADDRESS = 'SP258BY8D71JCTV73A4V3ADPHCVWSBEM6G4FETPYF';
export const CONTRACT_NAME = 'stackstactoe-gammar';
export const CONTRACT_FULL_NAME = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

export const ADMIN_WALLETS = [
  'SP258BY8D71JCTV73A4V3ADPHCVWSBEM6G4FETPYF', // Richiey1 / DamilareK
  'SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2', // TheBabalola
  'SP3TXKY0REKG6P3W6ACFB615N5556EC8VYS4MFA4D', // BbKenny
];

export const APP_NAME = 'StacksTacToe';
export const APP_ICON = '/logo.png';

export const FUNCTION_NAMES = {
  CREATE_GAME: 'create-game',
  JOIN_GAME: 'join-game',
  PLAY: 'play',
  FORFEIT_GAME: 'forfeit-game',
  CLAIM_REWARD: 'claim-reward',
  SET_PLATFORM_FEE: 'set-platform-fee',
  SET_MOVE_TIMEOUT: 'set-move-timeout',
  PAUSE_CONTRACT: 'pause-contract',
  UNPAUSE_CONTRACT: 'unpause-contract'
} as const;
