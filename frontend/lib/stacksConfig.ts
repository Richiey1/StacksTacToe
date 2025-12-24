// src/lib/stacksConfig.ts
import { StacksMainnet, StacksTestnet } from '@stacks/network';

// Network configuration
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

// Contract configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const CONTRACT_NAME = 'stackstactoe-game';

// App configuration
export const APP_NAME = 'StacksTacToe';
export const APP_ICON = '/logo.png';

// API configuration
export const STACKS_API_URL = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
  ? 'https://api.mainnet.hiro.so'
  : 'https://api.testnet.hiro.so';
