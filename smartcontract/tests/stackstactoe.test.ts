import { Cl } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

describe("StacksTacToe Game Contract - STX Only", () => {
  describe("Player Registration", () => {
    it("should allow player registration with unique username", () => {
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

    it("should not allow re-registration of same address", () => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("Alice")],
        alice
      );

      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("AliceNew")],
        alice
      );
      expect(result).toBeErr(Cl.uint(107)); // ERR_ALREADY_REGISTERED
    });
  });

  describe("Game Creation", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "register-player",
        [Cl.stringAscii("Alice")],
        alice
      );
    });

    it("should allow creating a 3x3 game with STX", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [
          Cl.uint(1000000), // 1 STX
          Cl.uint(0), // top-left cell
          Cl.uint(3), // 3x3 board
        ],
        alice
      );

      expect(result).toBeOk(Cl.uint(0)); // Game ID 0
    });

    it("should allow creating a 5x5 game", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [
          Cl.uint(500000),
          Cl.uint(12), // center of 5x5
          Cl.uint(5),
        ],
        alice
      );

      expect(result).toBeOk(Cl.uint(0));
    });

    it("should not allow creating game without registration", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)],
        bob
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR_NOT_REGISTERED
    });

    it("should not allow zero bet amount", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(0), Cl.uint(0), Cl.uint(3)],
        alice
      );

      expect(result).toBeErr(Cl.uint(109)); // ERR_INVALID_BET
    });

    it("should not allow invalid board sizes", () => {
      const result4x4 = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(4)],
        alice
      );
      expect(result4x4.result).toBeErr(Cl.uint(108)); // ERR_INVALID_BOARD_SIZE

      const result2x2 = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(2)],
        alice
      );
      expect(result2x2.result).toBeErr(Cl.uint(108));
    });

    it("should not allow invalid move index", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(10), Cl.uint(3)], // index 10 is out of bounds for 3x3
        alice
      );

      expect(result).toBeErr(Cl.uint(110)); // ERR_INVALID_MOVE
    });
  });

  describe("Joining Games", () => {
    beforeEach(() => {
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
    });

    it("should allow joining a game", () => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)],
        alice
      );

      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "join-game",
        [Cl.uint(0), Cl.uint(4)], // center cell
        bob
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should not allow joining non-existent game", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "join-game",
        [Cl.uint(999), Cl.uint(4)],
        bob
      );

      expect(result).toBeErr(Cl.uint(111)); // ERR_INVALID_ID
    });

    it("should not allow creator to join their own game", () => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)],
        alice
      );

      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "join-game",
        [Cl.uint(0), Cl.uint(4)],
        alice
      );

      expect(result).toBeErr(Cl.uint(114)); // ERR_SELF_PLAY
    });

    it("should not allow joining occupied cell", () => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)],
        alice
      );

      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "join-game",
        [Cl.uint(0), Cl.uint(0)], // same cell as alice
        bob
      );

      expect(result).toBeErr(Cl.uint(115)); // ERR_CELL_OCCUPIED
    });
  });

  describe("Playing Moves", () => {
    beforeEach(() => {
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
      simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)],
        alice
      );
      simnet.callPublicFn(
        "stackstactoe-game",
        "join-game",
        [Cl.uint(0), Cl.uint(4)],
        bob
      );
    });

    it("should allow player to make a move on their turn", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(1)], // game 0, cell 1
        alice
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should not allow playing out of turn", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(1)],
        bob // Bob's turn is after Alice
      );

      expect(result).toBeErr(Cl.uint(116)); // ERR_NOT_YOUR_TURN
    });

    it("should not allow playing on occupied cell", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(0)], // cell 0 is occupied by Alice
        alice
      );

      expect(result).toBeErr(Cl.uint(115)); // ERR_CELL_OCCUPIED
    });
  });

  describe("Winning a Game", () => {
    beforeEach(() => {
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
    });

    it("should detect horizontal win (row 1)", () => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)],
        alice
      ); // X at 0
      simnet.callPublicFn(
        "stackstactoe-game",
        "join-game",
        [Cl.uint(0), Cl.uint(3)],
        bob
      ); // O at 3
      simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(1)],
        alice
      ); // X at 1
      simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(4)],
        bob
      ); // O at 4
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(2)],
        alice
      ); // X at 2 - wins!

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should detect vertical win", () => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)],
        alice
      ); // X at 0
      simnet.callPublicFn(
        "stackstactoe-game",
        "join-game",
        [Cl.uint(0), Cl.uint(1)],
        bob
      ); // O at 1
      simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(3)],
        alice
      ); // X at 3
      simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(2)],
        bob
      ); // O at 2
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(6)],
        alice
      ); // X at 6 - wins!

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should detect diagonal win", () => {
      simnet.callPublicFn(
        "stackstactoe-game",
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)],
        alice
      ); // X at 0
      simnet.callPublicFn(
        "stackstactoe-game",
        "join-game",
        [Cl.uint(0), Cl.uint(1)],
        bob
      ); // O at 1
      simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(4)],
        alice
      ); // X at 4
      simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(2)],
        bob
      ); // O at 2
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "play",
        [Cl.uint(0), Cl.uint(8)],
        alice
      ); // X at 8 - wins!

      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Admin Functions", () => {
    it("should allow admin to pause contract", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "pause-contract",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should not allow non-admin to pause contract", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "pause-contract",
        [],
        alice
      );

      expect(result).toBeErr(Cl.uint(104)); // ERR_NOT_ADMIN
    });

    it("should allow admin to set platform fee", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "set-platform-fee",
        [Cl.uint(500)], // 5%
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });
  });
});
