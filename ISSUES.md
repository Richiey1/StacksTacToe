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

## ❌ Pending Issues

### Issue #4: Leaderboard & Player Profile Refactor
- **Status**: ❌ PENDING
- **Description**: Update the "Leaderboard coming soon" UI to the retro style. Refactor the "Players Profile" tab from challenge-based logic to actual player profile logic with a matching retro UI.
- **Tasks**:
  - [ ] Implement retro-style Leaderboard view
  - [ ] Refactor Profile logic to track individual player stats
  - [ ] Design retro UI for player profiles

### Issue #5: Mobile Responsiveness
- **Status**: ❌ PENDING
- **Description**: Ensure full mobile responsiveness across all app sections (Arena, Battle, Creation, Profile).
- **Tasks**:
  - [ ] Test and fix layout for small screens
  - [ ] Optimize retro components for touch targets
  - [ ] Ensure consistent scaling on mobile

### Issue #6: Subgraph Indexing
- **Status**: ❌ PENDING
- **Description**: Implement a subgraph to index game events for efficient querying.
- **Tasks**:
  - [ ] Define schema.graphql
  - [ ] Implement mappings.ts
  - [ ] Configure subgraph.yaml

### Issue #7: Mainnet Deployment
- **Status**: ❌ PENDING
- **Description**: Deploy finalized contracts and frontend to Mainnet.
- **Tasks**:
  - [ ] Deploy contract to Mainnet
  - [ ] Update frontend config
  - [ ] Verify deployment
