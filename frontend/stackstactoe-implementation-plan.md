# StacksTacToe Frontend - Full Implementation Plan

## Goal
Replicate **every feature** from BlocxTacToe frontend into StacksTacToe, adapted for Stacks blockchain.

---

## Features to Implement (from BlocxTacToe Analysis)

### 1. Game Modal (`GameModal.tsx`) ✅
**Current Status**: ✅ Complete
**Features Implemented**:
- Full-screen game view with board
- Player info display (addresses + usernames)
- Bet amount and token display
- Countdown timer for move timeout
- Game status indicators (waiting/active/finished)
- Turn indicator ("Your turn!" / "Waiting for opponent...")
- Winner/loser/draw messages
- Claim reward button (for winners)
- Share victory button
- Forfeit game button (when timeout allows)
- Join game flow (select cell → confirm modal)
- Real-time board updates via polling
- Refresh button
- Winning cells highlight
- Support for 3x3, 5x5, 7x7 boards

### 2. Games List (`GamesList.tsx`)
**Current Status**: Basic placeholder
**Features Needed**:
- Game cards showing:
  - Status badge (Waiting/Active/Finished)
  - "Your Game" badge
  - Player 1 & Player 2 with usernames
  - Trophy icon for winners
  - Bet amount with token
  - Board size (3x3, 5x5, etc.)
  - Countdown timer for active games
  - "Can Forfeit" indicator
  - Draw indicator
- Color coding:
  - Player 1 (X) = Blue
  - Player 2 (O) = Orange  
  - Winner = Yellow
  - Draw = White text, colored icons
- "Join Game" button for waiting games
- Click to view/play active/finished games
- Mobile-responsive layout

### 3. Player Display Component ✅
**Current Status**: ✅ Complete
**Features Implemented**:
- Show address (truncated)
- Show username (from contract)
- Trophy icon for winners
- Color coding based on player role and game status
- Responsive text sizing

### 4. Countdown Timer (`CountdownTimer.tsx`) ✅
**Current Status**: ✅ Complete
**Features Implemented**:
- Display time remaining in HH:MM:SS
- Warning color when < 1 hour remaining
- Handle expired timers (00:00:00)

### 5. Modals ✅
**Current Status**: ✅ Complete

#### Join Game Modal (`JoinGameModal.tsx`)
- Confirm bet amount
- Confirm selected move
- Loading state during transaction

#### Forfeit Modal (`ForfeitModal.tsx`)
- Warning message
- Confirm/cancel buttons
- Loading state

### 6. Game Board (`GameBoard.tsx`) ✅
**Current Status**: ✅ Complete
**Features Implemented**:
- Support for 3x3, 5x5, 7x7 boards
- Winning cells highlight
- Disabled state styling
- Hover effects
- Selected cell indicator (for join flow)

### 7. Create Game Page
**Current Status**: Basic form exists
**Features Needed**:
- Board size selector (3x3, 5x5, 7x7)
- Bet amount input
- First move selector (interactive board preview)
- Token selector (STX only for now)
- Form validation
- Transaction feedback

### 8. Leaderboard
**Current Status**: Placeholder
**Features Needed**:
- Top 10 players
- Rank badges (🥇🥈🥉)
- Username display
- Wins count
- Rating display
- Sorted by rating → wins → address

### 9. Challenges System
**Current Status**: Placeholder
**Features Needed**:
- Create challenge (select opponent by username/address)
- View incoming challenges
- View outgoing challenges
- Accept/decline buttons
- Challenge details (bet, board size)

### 10. Admin Panel
**Current Status**: Missing
**Features Needed**:
- Set platform fee
- Set fee recipient
- Pause/unpause contract
- Set move timeout
- Admin-only access control

---

## Implementation Steps

### Phase 1: Core Components ✅ COMPLETE
- [x] Create `GameModal.tsx` with full feature set
- [x] Create `PlayerDisplay.tsx` component
- [x] Create `CountdownTimer.tsx` component
- [x] Enhance `GameBoard.tsx` for multi-size support
- [x] Create `JoinGameModal.tsx`
- [x] Create `ForfeitModal.tsx`
- [x] Add `forfeitGame` and `claimReward` to contract hook

**Status**: ✅ All components created and committed (7 commits, ~1,100 lines)
**Pushed to GitHub**: Yes

### Phase 2: Game List & Display (Priority 1) ✅ COMPLETE
- [x] Enhance `GamesList.tsx` with all features
- [x] Add game status badges
- [x] Add player username fetching
- [x] Add countdown timers to game cards
- [x] Add color coding system
- [x] Add responsive layout

**Status**: ✅ GamesList component created (262 lines)
**Pushed to GitHub**: Yes

### Phase 3: Pages (Priority 2) ✅ COMPLETE
- [x] Enhance Create Game page
- [x] Create Play Game page (`/play/[gameId]`)
- [x] Implement Leaderboard page
- [x] Implement Challenges page (placeholder)
- [x] Update home page with tab navigation

**Status**: ✅ All pages created (6 components, ~800 lines)
**Pushed to GitHub**: Yes

### Phase 4: Data & State Management (Priority 1) ✅ COMPLETE
- [x] Enhance `useGameData.ts` to fetch:
  - Player usernames
  - Time remaining
  - Board state (all cells)
  - Claimable rewards
  - Reward claimed status
- [x] Add polling for real-time updates
- [x] Add query invalidation after transactions
- [x] Optimize with React Query caching

**Status**: ✅ All hooks implemented (10+ hooks, ~450 lines)
**Commits**: 3 modular commits
- `feat: enhance useGameData with comprehensive hooks and polling`
- `feat: add game utility functions for state management`
- `feat: integrate query invalidation into contract hooks`


### Phase 5: Contract Integration (Priority 1) ✅ COMPLETE
- [x] Verify `createGame` function
- [x] Verify `joinGame` function
- [x] Verify `play` function
- [x] Implement `forfeitGame` function
- [x] Implement `claimReward` function
- [x] Implement `createChallenge` function (Shareable Links)
- [x] Implement `acceptChallenge` function (URL Routing)
- [x] Implement Admin Panel (Fee, Timeout, Pause)

**Status**: ✅ All contract functions integrated & verified
**Commits**: 3 modular commits (Game Logic, Admin, Sharing)

### Phase 6: Polish & UX (Priority 2) ✅ COMPLETE
- [x] Add loading states (Spinners everywhere)
- [x] Add error handling (Try/Catch + Toasts)
- [x] Add success toasts (React Hot Toast)
- [x] Add share functionality (Clipboard copy)
- [x] Add keyboard shortcuts (ESC to close modals)
- [x] Add animations (Transitions)
- [x] Mobile optimization (Responsive Tailwind classes)

**Status**: ✅ UX polished and responsive

---

## Key Differences: BlocxTacToe (Base) vs StacksTacToe (Stacks)

| Feature | BlocxTacToe | StacksTacToe |
|---------|-------------|--------------|
| Blockchain | Base (EVM) | Stacks |
| Wallet | Wagmi/RainbowKit | Stacks Connect |
| Contract Calls | `useWriteContract` | `openContractCall` |
| Read Data | `useReadContract` | `fetchCallReadOnlyFunction` |
| Address Format | `0x...` | `SP...` / `ST...` |
| Token | ETH/ERC20 | STX |
| Block Time | ~2 seconds | ~10 minutes (Bitcoin) |
| Timeout Logic | Block-based | **Time-based (Clarity 4)** |

---

## Progress Summary

### ✅ Completed (Phases 1-6)
1. ✅ Core Components & UI
2. ✅ Game List & Display
3. ✅ Pages & Navigation
4. ✅ Data & State Management (Hooks)
5. ✅ Contract Integration (Admin, Sharing, Logic)
6. ✅ Polish & UX (Toasts, Mobile)

### 🔄 Current Focus
- Project Verification & Deployment

### 📋 Next Steps
1. Final end-to-end testing
2. Deployment to Stacks Mainnet/Testnet
