import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

// Use a dummy principal for token address (will be treated as STX since not in supported-tokens map)
const STX_TOKEN = deployer; // Any principal not in supported-tokens map = STX

describe("StacksTacToe Game Contract", () => {
  describe("Player Registration", () => {
    it("should allow player registration", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("Alice")],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should not allow duplicate usernames", () => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("Alice")],
        alice
      );

      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("Alice")],
        bob
      );
      expect(result).toBeErr(Cl.uint(106)); // ERR_USERNAME_TAKEN
    });
  });

  describe("Game Creation", () => {
    it("should allow creating a game with STX", () => {
      // Register player first
      simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("Alice")],
        alice
      );

      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [
          Cl.uint(1000000), // bet amount (1 STX)
          Cl.uint(0), // move index (top-left cell)
          Cl.principal(STX_TOKEN), // token address (STX)
          Cl.uint(3), // board size (3x3)
        ],
        alice
      );

      expect(result).toBeOk(Cl.uint(0)); // Game ID 0
    });

    it("should not allow creating game without registration", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [
          Cl.uint(1000000),
          Cl.uint(0),
          Cl.principal(STX_TOKEN),
          Cl.uint(3),
        ],
        bob
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR_NOT_REGISTERED
    });

    it("should not allow invalid board size", () => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("Alice")],
        alice
      );

      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [
          Cl.uint(1000000),
          Cl.uint(0),
          Cl.principal(STX_TOKEN),
          Cl.uint(4), // Invalid board size
        ],
        alice
      );

      expect(result).toBeErr(Cl.uint(108)); // ERR_INVALID_BOARD_SIZE
    });
  });

  describe("Joining Games", () => {
    it("should allow joining a game", () => {
      // Register both players
      simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("Alice")],
        alice
      );
      simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("Bob")],
        bob
      );

      // Alice creates a game
      simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.principal(STX_TOKEN), Cl.uint(3)],
        alice
      );

      // Bob joins the game
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "join-game",
        [
          Cl.uint(0), // game ID
          Cl.uint(4), // move index (center cell)
        ],
        bob
      );

      expect(result).toBeOk(Cl.bool(true));
    });
  });
});
