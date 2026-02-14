# StacksTacToe Issues Tracker

This file tracks the UI/UX and contract development for StacksTacToe.

## ✅ Completed Issues

### Issue #1: Retro UI Refactor (Games Tab)
- **Status**: ✅ COMPLETED
- **Description**: Refactor the Games List, Active Games, and Finished Games views to a retro theme.
- **Tasks**:
  - [x] Apply `.nes-container` to game cards
  - [x] Apply `.btn-retro` to action buttons
  - [x] Update typography to `.font-pixel`
  - [x] Standardize colors (Orange/Black)

### Issue #2: Retro UI Refactor (Game Modal)
- **Status**: ✅ COMPLETED
- **Description**: Refactor the Game Modal and Board to a retro theme.
- **Tasks**:
  - [x] Apply `.nes-container` to modal content
  - [x] Refactor board cells to arcade-style buttons
  - [x] Update status badges and banners
  - [x] Standardize typography and colors

### Issue #3: Retro UI Refactor (Create Game Tab)
- **Status**: ✅ COMPLETED
- **Description**: Refactor the Create Game form and selectors to a retro theme.
- **Tasks**:
  - [x] Apply `.nes-container` to form container
  - [x] Refactor grid size and first move selectors
  - [x] Update input styles
  - [x] Standardize typography and colors

### Issue #4: Leaderboard & Player Profile Refactor
- **Status**: ✅ COMPLETED
- **Description**: Updated the "Leaderboard coming soon" UI to the retro style. Refactored the "Players Profile" tab from challenge-based logic to actual player profile logic with a matching retro UI.
- **Tasks**:
  - [x] Implement retro-style Leaderboard view
  - [x] Refactor Profile logic to track individual player stats
  - [x] Design retro UI for player profiles

### Issue #5: Mobile Responsiveness
- **Status**: ✅ COMPLETED
- **Description**: Ensured full mobile responsiveness across all app sections (Arena, Battle, Creation, Profile).
- **Tasks**:
  - [x] Test and fix layout for small screens
  - [x] Optimize retro components for touch targets
  - [x] Ensure consistent scaling on mobile

### Issue #6: Win/Draw Logic & Leaderboard Statistics
- **Status**: ✅ COMPLETED
- **Description**: Implemented robust on-chain win detection for 5x5 boards and global player statistics.
- **Tasks**:
  - [x] Implement 5-in-a-row win condition for 5x5 Advanced board
  - [x] Fix draw detection logic using on-chain move-count
  - [x] Implement `player-stats` map for tracking wins and STX earnings
  - [x] Unlock Leaderboard UI and populate with real on-chain data
  - [x] Add `get-time-remaining` read-only function for UI countdowns
  - [x] Fix frontend to calculate wins/losses/draws from game history for accurate display

## ❌ Pending Issues

### Issue #7: Subgraph Indexing
- **Status**: ❌ PENDING
- **Description**: Implement a subgraph to index game events for efficient querying.
- **Tasks**:
  - [ ] Define schema.graphql
  - [ ] Implement mappings.ts
  - [ ] Configure subgraph.yaml

### Issue #8: Mainnet Deployment
- **Status**: ❌ PENDING
- **Description**: Deploy finalized contracts and frontend to Mainnet.
- **Tasks**:
  - [ ] Deploy contract to Mainnet
  - [ ] Update frontend config
  - [ ] Verify deployment
