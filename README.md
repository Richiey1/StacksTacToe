# StacksTacToe

A decentralized **Player vs Player (PvP)** Tic-Tac-Toe game built on the Stacks blockchain, where players compete in winner-takes-all matches with real stakes.

## Overview

StacksTacToe is a **competitive PvP betting game** that brings the classic Tic-Tac-Toe to Web3. Players can challenge each other to matches with cryptocurrency wagers, where the winner takes all. All game moves and outcomes are verified and stored on the Stacks blockchain, ensuring complete fairness and transparency.

### How It Works

1. **Create a Game** - Set your wager amount and choose your token
2. **Challenge Opponent** - Wait for another player to accept your bet
3. **Play to Win** - Make your moves on-chain
4. **Winner Takes All** - The victor claims the entire pot automatically

### Supported Tokens

- **STX** (Default) - Stacks native token
- **sBTC** - Bitcoin on Stacks
- **BTC** - Bitcoin (via cross-chain bridge)
- **USDCx** - USDC on Stacks

## Deployed Contract

**Mainnet Contract:**
- **Address**: `SP258BY8D71JCTV73A4V3ADPHCVWSBEM6G4FETPYF.stackstactoe-alpha`
- **Network**: Stacks Mainnet
- **Clarity Version**: 3
- **Explorer**: [View on Explorer](https://explorer.hiro.so/txid/SP258BY8D71JCTV73A4V3ADPHCVWSBEM6G4FETPYF.stackstactoe-alpha?chain=mainnet)

## Features (Coming Soon)

- 🎮 **PvP Betting** - Winner-takes-all matches with real stakes
- � **Multi-Token Support** - Bet with STX, sBTC, BTC, or USDCx
- 🏆 **Provably Fair** - All moves verified on-chain, no cheating possible
- ⚡ **Instant Payouts** - Winners receive funds automatically via smart contract
- � **Open Challenges** - Create public games or challenge specific players
- 📊 **Leaderboard** - Track top players and biggest wins
- 🔐 **Secure Wallet Integration** - Connect with Leather or Xverse wallets
- 📈 **Game History** - Complete record of all your matches on-chain

## Project Structure

```
StacksTacToe/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utility functions
│
├── smartcontract/    # Clarity smart contracts
│   ├── contracts/    # Game contract source
│   ├── tests/        # Contract tests
│   └── settings/     # Network configurations
│
└── README.md         # This file
```

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@stacks/connect** - Wallet connection
- **@stacks/transactions** - Blockchain interactions

### Smart Contract
- **Clarity** - Smart contract language for Stacks
- **Clarinet** - Development and testing tool
- **Vitest** - Test runner

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Clarinet (for smart contract development)
- A Stacks wallet (Leather or Xverse)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Richiey1/StacksTacToe.git
   cd StacksTacToe
   ```

2. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

3. **Set up the smart contract**
   ```bash
   cd smartcontract
   npm install
   npm run test
   ```

## Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

### Smart Contract Development

```bash
cd smartcontract
npm run test              # Run tests
npm run test:report       # Run tests with coverage
npm run test:watch        # Watch mode for development
```

## Deployment

### Frontend Deployment

The frontend can be deployed to Vercel, Netlify, or any platform that supports Next.js applications.

### Smart Contract Deployment

Contracts can be deployed to Stacks testnet or mainnet using Clarinet:

```bash
cd smartcontract
clarinet deployments generate --testnet --low-cost
clarinet deployment apply -p deployments/default.testnet-plan.yaml
```

## Documentation

- **Frontend Documentation**: See [frontend/README.md](./frontend/README.md)
- **Smart Contract Documentation**: See [smartcontract/README.md](./smartcontract/README.md)
- **Stacks Integration Guide**: See [frontend/stacks-frontend-integration-guide.md](./frontend/stacks-frontend-integration-guide.md)
- **Clarity Development Guide**: See [smartcontract/clarity-smartcontract-guide.md](./smartcontract/clarity-smartcontract-guide.md)

## Resources

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language Reference](https://docs.stacks.co/docs/clarity)
- [Stacks.js Documentation](https://stacks.js.org)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Next.js Documentation](https://nextjs.org/docs)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Status

🚧 **In Development** - This project is actively being built. Game features coming soon!

## Contact

- GitHub: [@Richiey1](https://github.com/Richiey1)
- Repository: [StacksTacToe](https://github.com/Richiey1/StacksTacToe)

---

Built with ❤️ on the Stacks blockchain
