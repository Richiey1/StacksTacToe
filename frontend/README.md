# StacksTacToe Frontend

A Next.js frontend application for StacksTacToe - a decentralized Tic-Tac-Toe game built on the Stacks blockchain.

## Overview

StacksTacToe brings the classic game of Tic-Tac-Toe to the blockchain, allowing players to compete in provably fair matches with on-chain game state and logic.

## Dependencies

### Stacks Packages

- **`@stacks/connect`** (v7.2.0) - Wallet connection and authentication
  - Connect user wallets (Leather, Xverse)
  - Handle user authentication and session management
  - Wallet connection UI components

- **`@stacks/transactions`** (v7.2.0) - Transaction building and signing
  - Build contract call transactions
  - Create Clarity values for game moves
  - Transaction utilities

### Core Packages

- **Next.js** (v16.0.8) - React framework with App Router
- **React** (v19.2.1) - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Features (Coming Soon)

- 🎮 **On-chain Game Logic**: All game moves verified on the blockchain
- 👥 **Multiplayer**: Challenge other players to matches
- 🏆 **Provably Fair**: Transparent game state and outcomes
- 💰 **Optional Wagering**: Play for fun or with STX stakes
- 📊 **Game History**: Track your wins, losses, and draws

## Deployed Contract

**Mainnet:**
- **Contract**: `SP258BY8D71JCTV73A4V3ADPHCVWSBEM6G4FETPYF.stackstactoe-gammar`
- **Network**: Stacks Mainnet
- **Clarity Version**: 3

The frontend is configured to interact with this contract via `frontend/config/constants.ts`.

## Project Structure

```
StacksTacToe/
├── smartcontract/       # Clarity smart contracts
│   ├── contracts/       # Game contract
│   ├── tests/           # Contract tests
│   └── README.md        # Contract documentation
└── frontend/            # Next.js frontend
    ├── app/             # Next.js pages
    ├── components/      # React components
    ├── hooks/           # Custom hooks
    └── README.md        # This file
```

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Prerequisites

- Node.js (v18+)
- A Stacks wallet (Leather or Xverse)
- Git

## Resources

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language](https://docs.stacks.co/docs/clarity)
- [Stacks.js](https://stacks.js.org)

## Status

🚧 **In Development** - Game features coming soon!
