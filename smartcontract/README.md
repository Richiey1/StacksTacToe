# StacksTacToe Smart Contract

Clarity smart contract implementation for StacksTacToe - a decentralized Tic-Tac-Toe game on the Stacks blockchain.

## Overview

The StacksTacToe smart contract enables on-chain Tic-Tac-Toe gameplay with provably fair outcomes. All game logic, moves, and state are stored and verified on the blockchain.

## Clarity Version

- **Current Version**: Clarity 3 (development)
- **Target Version**: Clarity 4 (for mainnet deployment)

## Project Structure

```
smartcontract/
├── contracts/           # Clarity smart contract files (.clar)
│   └── game.clar       # Main game contract
├── tests/              # Test files (.test.ts)
│   └── game.test.ts    # Game contract tests
├── settings/           # Network configuration
│   ├── Devnet.toml    # Development network settings
│   └── Testnet.toml   # Testnet deployment settings
├── deployments/        # Deployment plans
├── Clarinet.toml       # Clarinet configuration
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## Features (Coming Soon)

- **On-chain Game State**: Complete game board stored on blockchain
- **Move Validation**: Smart contract validates all moves
- **Win Detection**: Automatic win/draw detection
- **Player Management**: Track players and game sessions
- **Game History**: Immutable record of all games

## Development Setup

### Prerequisites

- Clarinet (Stacks smart contract development tool)
- Node.js (v18+)

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
npm run test
```

### Run Tests with Coverage

```bash
npm run test:report
```

## Contract Functions (Planned)

### Public Functions

- `create-game` - Start a new game session
- `make-move` - Submit a move (X or O)
- `get-game-state` - Retrieve current game board
- `claim-victory` - Claim win when conditions are met

### Read-Only Functions

- `get-board` - Get current board state
- `check-winner` - Check if there's a winner
- `is-valid-move` - Validate a proposed move

## Testing

Tests are written using Vitest and the Clarinet SDK:

```bash
npm run test        # Run tests once
npm run test:watch  # Watch mode for development
```

## Deployment

### Testnet Deployment

```bash
clarinet deployments generate --testnet --low-cost
clarinet deployment apply -p deployments/default.testnet-plan.yaml
```

### Mainnet Deployment

Coming soon after testing phase.

## Dependencies

### Testing Dependencies

- **`@stacks/clarinet-sdk`** (v3.11.0) - Clarity contract testing
- **`@stacks/clarinet-sdk-wasm`** (v3.11.0) - WASM runtime
- **`@stacks/transactions`** (v7.2.0) - Transaction utilities
- **`vitest`** (v3.2.4) - Test runner
- **`vitest-environment-clarinet`** (v3.0.2) - Clarinet test environment

## Resources

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language](https://docs.stacks.co/docs/clarity)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)

## Status

🚧 **In Development** - Game contract coming soon!
