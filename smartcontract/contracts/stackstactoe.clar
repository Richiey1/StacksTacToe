;; StacksTacToe - Decentralized PvP Tic-Tac-Toe Game
;; A winner-takes-all betting game on Stacks blockchain
;; Supports STX, sBTC, BTC, and USDCx tokens

;; ============================================
;; Constants
;; ============================================

;; Contract owner
(define-constant CONTRACT_OWNER tx-sender)

;; Game parameters
(define-constant DEFAULT_MOVE_TIMEOUT u144) ;; ~24 hours in blocks (assuming 10 min blocks)
(define-constant MAX_TIMEOUT u1008) ;; ~7 days in blocks
(define-constant DEFAULT_BOARD_SIZE u3)
(define-constant LEADERBOARD_SIZE u100)
(define-constant DEFAULT_K_FACTOR u100) ;; ELO rating change factor
(define-constant STARTING_RATING u1000) ;; Starting ELO rating
(define-constant MAX_USERNAME_LENGTH u32)

;; Game status
(define-constant STATUS_ACTIVE u0)
(define-constant STATUS_ENDED u1)
(define-constant STATUS_FORFEITED u2)

;; Player marks
(define-constant MARK_EMPTY u0)
(define-constant MARK_X u1)
(define-constant MARK_O u2)

;; Basis points for fee calculation (10000 = 100%)
(define-constant BASIS_POINTS u10000)

;; ============================================
;; Error Codes
;; ============================================

(define-constant ERR_INVALID_ID (err u100))
(define-constant ERR_NOT_ACTIVE (err u101))
(define-constant ERR_INVALID_MOVE (err u102))
(define-constant ERR_NOT_TURN (err u103))
(define-constant ERR_INVALID_BET (err u104))
(define-constant ERR_BET_MISMATCH (err u105))
(define-constant ERR_GAME_STARTED (err u106))
(define-constant ERR_CELL_OCCUPIED (err u107))
(define-constant ERR_TIMEOUT (err u108))
(define-constant ERR_UNAUTHORIZED (err u109))
(define-constant ERR_SELF_PLAY (err u110))
(define-constant ERR_TRANSFER_FAILED (err u111))
(define-constant ERR_INVALID_ADDR (err u112))
(define-constant ERR_USERNAME_TAKEN (err u113))
(define-constant ERR_INVALID_USERNAME (err u114))
(define-constant ERR_NOT_REGISTERED (err u115))
(define-constant ERR_NOT_ADMIN (err u116))
(define-constant ERR_INVALID_TIMEOUT (err u117))
(define-constant ERR_INVALID_FEE (err u118))
(define-constant ERR_INVALID_K_FACTOR (err u119))
(define-constant ERR_TOKEN_NOT_SUPPORTED (err u120))
(define-constant ERR_CHALLENGE_ACCEPTED (err u121))
(define-constant ERR_SELF_CHALLENGE (err u122))
(define-constant ERR_NO_REWARD (err u123))
(define-constant ERR_REWARD_CLAIMED (err u124))
(define-constant ERR_NOT_WINNER (err u125))
(define-constant ERR_INVALID_BOARD_SIZE (err u126))
(define-constant ERR_GAME_NOT_FINISHED (err u127))
(define-constant ERR_ALREADY_REGISTERED (err u128))
(define-constant ERR_PAUSED (err u129))

;; ============================================
;; Data Variables
;; ============================================

;; Admin and configuration
(define-data-var contract-paused bool false)
(define-data-var move-timeout uint DEFAULT_MOVE_TIMEOUT)
(define-data-var platform-fee-percent uint u0) ;; Default: no fee
(define-data-var platform-fee-recipient principal CONTRACT_OWNER)
(define-data-var k-factor uint DEFAULT_K_FACTOR)

;; Counters
(define-data-var game-id-counter uint u0)
(define-data-var challenge-id-counter uint u0)

;; ============================================
;; Data Maps
;; ============================================

;; Admin management
(define-map admins principal bool)

;; Supported tokens (principal 'STX for native STX)
(define-map supported-tokens principal bool)
(define-map token-names principal (string-ascii 20))

;; Player data
(define-map players 
    principal 
    {
        username: (string-utf8 32),
        wins: uint,
        losses: uint,
        draws: uint,
        total-games: uint,
        rating: uint,
        registered: bool
    }
)

(define-map username-to-address (string-utf8 32) principal)

;; Game data
(define-map games
    uint
    {
        player-one: principal,
        player-two: (optional principal),
        bet-amount: uint,
        token-address: principal,
        board-size: uint,
        is-player-one-turn: bool,
        winner: (optional principal),
        last-move-block: uint,
        status: uint
    }
)

;; Game boards (game-id => cell-index => mark)
(define-map game-boards { game-id: uint, cell-index: uint } uint)

;; Claimable rewards
(define-map claimable-rewards uint uint)
(define-map reward-claimed uint bool)

;; Challenge system
(define-map challenges
    uint
    {
        challenger: principal,
        challenger-username: (string-utf8 32),
        challenged: principal,
        challenged-username: (string-utf8 32),
        bet-amount: uint,
        token-address: principal,
        board-size: uint,
        created-at-block: uint,
        accepted: bool,
        game-id: (optional uint)
    }
)

;; Player challenges (for tracking)
(define-map player-challenges principal (list 100 uint))

;; Leaderboard
(define-map leaderboard-entries
    uint
    {
        player: principal,
        username: (string-utf8 32),
        rating: uint,
        wins: uint
    }
)

(define-data-var leaderboard-size uint u0)

;; ============================================
;; Initialization
;; ============================================

;; Set contract owner as admin
(map-set admins CONTRACT_OWNER true)

;; Set STX as supported token by default
(map-set supported-tokens 'STX true)
(map-set token-names 'STX "STX")

;; ============================================
;; Private Helper Functions
;; ============================================

(define-private (is-admin (caller principal))
    (or 
        (is-eq caller CONTRACT_OWNER)
        (default-to false (map-get? admins caller))
    )
)

(define-private (is-registered (player principal))
    (default-to false (get registered (map-get? players player)))
)

;; ============================================
;; Admin Functions
;; ============================================

(define-public (add-admin (admin principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (ok (map-set admins admin true))
    )
)

(define-public (remove-admin (admin principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (ok (map-set admins admin false))
    )
)

(define-public (set-move-timeout (new-timeout uint))
    (begin
        (asserts! (is-admin tx-sender) ERR_NOT_ADMIN)
        (asserts! (and (> new-timeout u0) (<= new-timeout MAX_TIMEOUT)) ERR_INVALID_TIMEOUT)
        (ok (var-set move-timeout new-timeout))
    )
)

(define-public (set-platform-fee (new-fee-percent uint))
    (begin
        (asserts! (is-admin tx-sender) ERR_NOT_ADMIN)
        (asserts! (<= new-fee-percent u1000) ERR_INVALID_FEE) ;; Max 10%
        (ok (var-set platform-fee-percent new-fee-percent))
    )
)

(define-public (set-platform-fee-recipient (recipient principal))
    (begin
        (asserts! (is-admin tx-sender) ERR_NOT_ADMIN)
        (ok (var-set platform-fee-recipient recipient))
    )
)

(define-public (set-k-factor (new-k-factor uint))
    (begin
        (asserts! (is-admin tx-sender) ERR_NOT_ADMIN)
        (asserts! (and (> new-k-factor u0) (<= new-k-factor u1000)) ERR_INVALID_K_FACTOR)
        (ok (var-set k-factor new-k-factor))
    )
)

(define-public (set-supported-token (token principal) (supported bool) (token-name (string-ascii 20)))
    (begin
        (asserts! (is-admin tx-sender) ERR_NOT_ADMIN)
        (map-set supported-tokens token supported)
        (if supported
            (map-set token-names token token-name)
            true
        )
        (ok true)
    )
)

(define-public (pause-contract)
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (ok (var-set contract-paused true))
    )
)

(define-public (unpause-contract)
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (ok (var-set contract-paused false))
    )
)

;; ============================================
;; Player Registration Functions
;; ============================================

(define-public (register-player (username (string-utf8 32)))
    (let
        (
            (username-length (len username))
        )
        (asserts! (and (> username-length u0) (<= username-length MAX_USERNAME_LENGTH)) ERR_INVALID_USERNAME)
        (asserts! (is-none (map-get? username-to-address username)) ERR_USERNAME_TAKEN)
        (asserts! (not (is-registered tx-sender)) ERR_ALREADY_REGISTERED)
        
        (map-set players tx-sender {
            username: username,
            wins: u0,
            losses: u0,
            draws: u0,
            total-games: u0,
            rating: STARTING_RATING,
            registered: true
        })
        
        (map-set username-to-address username tx-sender)
        (ok true)
    )
)

(define-read-only (get-player (player principal))
    (ok (map-get? players player))
)

(define-read-only (get-player-by-username (username (string-utf8 32)))
    (let
        (
            (player-addr (map-get? username-to-address username))
        )
        (match player-addr
            addr (ok { address: addr, player: (map-get? players addr) })
            (ok { address: none, player: none })
        )
    )
)
