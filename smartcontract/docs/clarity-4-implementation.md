# Clarity 4 Implementation Guide

This guide outlines the steps to upgrade the `stackstactoe` contract to Clarity 4, leveraging its new features for better user experience and code safety.

## 1. Time-Based Logic (Timeout Handling)

**Current Implementation**:
- Uses `stacks-block-height` (block count) for move timeouts.
- `DEFAULT_MOVE_TIMEOUT` is `u144` (approx. 24 hours).
- Issues: Block times can vary, making "24 hours" imprecise.

**Clarity 4 Upgrade**:
- Use the new **Block Timestamp** keyword/function (likely `burn-block-time` or `block-time` check specific syntax) to handle timeouts in seconds.
- Change `move-timeout` to seconds (e.g., `u86400` for 24 hours).
- Update `games` map: `last-move-block` -> `last-move-time`.

**Implementation Steps**:
1.  Update constants:
    ```clarity
    (define-constant DEFAULT_MOVE_TIMEOUT u86400) ;; 24 hours in seconds
    (define-constant MAX_TIMEOUT u604800) ;; 7 days in seconds
    ```
2.  Update `games` map definition:
    ```clarity
    last-move-time: uint
    ```
3.  Update logic in `create-game`, `join-game`, `play`:
    - Store `burn-block-time` (or equivalent) instead of `stacks-block-height`.
4.  Update `forfeit-game`:
    - Check `(>= burn-block-time (+ (get last-move-time game) (var-get move-timeout)))`.

## 2. String Conversions

**Feature**: Convert simple values (bool, principal) to ASCII strings.
**Usage**:
- Currently, usernames are `(string-utf8 32)`.
- We could potentially generate game IDs or unique identifiers by converting principals to strings if needed (e.g., "game-SP123...").

## 3. Contract Verification (On-chain)

**Feature**: Get contract code hash.
**Usage**:
- Future feature: Allow verifying that an opponent is playing via a "verified" frontend or contract wrapper?
- For now, low priority for the core game.

## 4. Post-Conditions for Dynamic Contracts

**Feature**: Set post-conditions within the contract.
**Usage**:
- If we re-introduce SIP-010 token support, we can use this to safely call `transfer` on unknown tokens passed as traits, enforcing that they don't drain the contract beyond the bet amount.

---

## Immediate Fixes Required (Pre-Upgrade)

During analysis, broken code was identified in the current version:
- `claim-reward` and `forfeit-game` are calling `transfer-payout` with **3 arguments** (including `token-address`).
- `transfer-payout` definition only accepts **2 arguments** (recipient, amount).
- **Action**: Remove the `token-address` argument from these calls to fix compilation errors.
