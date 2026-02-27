# StacksTacToe Subgraph

This subgraph indexes all game events for the StacksTacToe smart contract.

## Prerequisites
- Node.js (v18+)
- The Graph CLI (`npm install -g @graphprotocol/graph-cli`)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate types from schema:
   ```bash
   npm run codegen
   ```

3. Build the subgraph:
   ```bash
   npm run build
   ```

## Local Development
To run a local Graph Node and deploy it locally:
```bash
npm run create-local
npm run deploy-local
```
