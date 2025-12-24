# SIP-010 Token Support - Future Enhancement

## Overview

This document explains why SIP-010 token support was removed from the initial deployment and how to implement it in the future.

---

## The Root Cause: Invalid Principal Literal

The deployment was failing with this error:

```
VM Error: missing contract name for call
```

### What Was Happening

1. **Original Design**: We tried to support both STX and SIP-010 tokens (sBTC, USDCx, etc.) in the same contract
2. **The Problem**: We were using `'STX` as a principal literal to represent native STX, but **`'STX` is not a valid principal in Clarity**
3. **The Failure**: When we tried to do `contract-call?` on what we thought was a SIP-010 token address, if it was actually just a random principal (not a valid contract), the deployment would fail

### Why It Failed

```clarity
;; This was WRONG - 'STX is not a valid principal
(define-constant STX_TOKEN 'STX)

;; When creating a game, users could pass ANY principal
(create-game bet-amount move-index 'STX board-size)

;; Later, when joining, we tried to call contract-call? on it
(contract-call? 'STX transfer ...) ;; FAILS! 'STX is not a contract
```

The error occurred because:
- Users could pass any principal as `token-address`
- We stored this principal in the game data
- When another player joined, we tried to call `contract-call?` on it
- If it wasn't a valid SIP-010 contract, the transaction failed with "missing contract name for call"

---

## The Solution

We **simplified the contract to only support STX** for now:

- ✅ **Removed** the `token-address` parameter from `create-game`, `join-game`, and `create-challenge`
- ✅ **Removed** all SIP-010 token logic and `contract-call?` attempts
- ✅ **Simplified** to only use `stx-transfer?` for all payments
- ✅ **Removed** the `supported-tokens` map and related admin functions

### What Changed

**Before (Multi-token - FAILED):**

```clarity
(define-public (create-game (bet-amount uint) (move-index uint) (token-address principal) (board-size uint))
    ;; ... validation ...
    
    ;; This approach failed!
    (if (is-eq token-address STX_TOKEN)
        (stx-transfer? bet-amount tx-sender (as-contract tx-sender))
        (contract-call? token-address transfer bet-amount tx-sender (as-contract tx-sender) none)
    )
    
    ;; Store token-address in game
    (map-set games game-id {
        ;; ...
        token-address: token-address,
        ;; ...
    })
)
```

**After (STX-only - SUCCESS):**

```clarity
(define-public (create-game (bet-amount uint) (move-index uint) (board-size uint))
    ;; ... validation ...
    
    ;; Simple and works!
    (stx-transfer? bet-amount tx-sender (as-contract tx-sender))
    
    ;; No token-address needed
    (map-set games game-id {
        ;; ...
        bet-amount: bet-amount,
        board-size: board-size,
        ;; ...
    })
)
```

---

## Future Implementation: How to Add SIP-010 Token Support

When you're ready to add SIP-010 token support, here's the **correct approach**:

### Option 1: Separate Game Types (Recommended)

Create separate functions for STX games and SIP-010 token games:

```clarity
;; For STX games (current implementation)
(define-public (create-stx-game (bet-amount uint) (move-index uint) (board-size uint))
    (try! (stx-transfer? bet-amount tx-sender (as-contract tx-sender)))
    ;; ... rest of game creation
)

;; For SIP-010 token games (future)
(define-public (create-token-game 
    (bet-amount uint) 
    (move-index uint) 
    (token-contract <sip-010-trait>) 
    (board-size uint))
    
    ;; Validate token is in whitelist
    (asserts! (is-whitelisted-token (contract-of token-contract)) ERR_TOKEN_NOT_SUPPORTED)
    
    ;; Transfer tokens
    (try! (contract-call? token-contract transfer 
        bet-amount tx-sender (as-contract tx-sender) none))
    
    ;; Store token contract in game
    (map-set games game-id {
        ;; ...
        token-contract: (some (contract-of token-contract)),
        ;; ...
    })
)
```

### Option 2: Use Trait References

Use Clarity traits to ensure type safety:

```clarity
;; Define or import SIP-010 trait
(use-trait sip-010-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Whitelist of approved tokens
(define-map whitelisted-tokens principal bool)

;; Admin function to whitelist tokens
(define-public (whitelist-token (token principal))
    (begin
        (asserts! (is-admin tx-sender) ERR_NOT_ADMIN)
        (ok (map-set whitelisted-tokens token true))
    )
)

;; Game creation with token
(define-public (create-game 
    (bet-amount uint) 
    (move-index uint) 
    (token <sip-010-trait>)
    (board-size uint))
    
    (let ((token-principal (contract-of token)))
        ;; Validate token is whitelisted
        (asserts! (default-to false (map-get? whitelisted-tokens token-principal)) 
            ERR_TOKEN_NOT_SUPPORTED)
        
        ;; Transfer using trait
        (try! (contract-call? token transfer 
            bet-amount tx-sender (as-contract tx-sender) none))
        
        ;; Store token principal
        (map-set games game-id {
            ;; ...
            token-address: token-principal,
            ;; ...
        })
    )
)
```

### Option 3: Token Registry Pattern

Create a registry of supported tokens with metadata:

```clarity
(define-map supported-tokens 
    principal 
    {
        name: (string-ascii 32),
        enabled: bool,
        min-bet: uint,
        max-bet: uint
    }
)

;; Admin adds supported token
(define-public (add-supported-token 
    (token principal) 
    (name (string-ascii 32))
    (min-bet uint)
    (max-bet uint))
    (begin
        (asserts! (is-admin tx-sender) ERR_NOT_ADMIN)
        (ok (map-set supported-tokens token {
            name: name,
            enabled: true,
            min-bet: min-bet,
            max-bet: max-bet
        }))
    )
)
```

---

## Key Lessons Learned

1. **Don't use invalid principals**: `'STX` is not a valid principal in Clarity
2. **Validate before storing**: Always validate token contracts before storing them in game data
3. **Use traits for type safety**: Clarity traits ensure you're calling valid SIP-010 contracts
4. **Whitelist approach**: Maintain a whitelist of approved token contracts
5. **Start simple**: STX-only is simpler and works. Add complexity later.

---

## Recommended Tokens for Future Support

When implementing SIP-010 support, consider these popular tokens:

- **sBTC** (Wrapped Bitcoin): `SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin`
- **USDCx** (Bridged USDC): Various implementations
- **ALEX**: `SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token`
- **STX20 tokens**: Various community tokens

---

## Testing Strategy

Before deploying SIP-010 support:

1. ✅ Test with mock SIP-010 contracts in Clarinet
2. ✅ Test token whitelisting/blacklisting
3. ✅ Test with actual testnet tokens
4. ✅ Verify refund logic works with tokens
5. ✅ Test edge cases (token contract paused, insufficient balance, etc.)

---

## Summary

**Current State**: Contract only supports STX betting and is successfully deployed to mainnet.

**Future Enhancement**: SIP-010 token support can be added using traits, whitelisting, and proper validation to avoid the "missing contract name for call" error.

**The Key**: Never try to use `'STX` as a principal. Instead, use separate functions for STX vs SIP-010 tokens, or use optional token parameters with proper trait validation.
