import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("StacksTacToe Game Contract - STX Only", () => {
  const CONTRACT_NAME = "stackstactoe-alpha";

  describe("Game Creation", () => {
    it("should allow creating a 3x3 game with STX", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-game",
        [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)],
        alice
      );
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("Winning a Game (3x3)", () => {
    it("should detect horizontal win (row 0)", () => {
      simnet.callPublicFn(CONTRACT_NAME, "create-game", [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)], alice); 
      simnet.callPublicFn(CONTRACT_NAME, "join-game", [Cl.uint(0), Cl.uint(3)], bob); 
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(1)], alice); 
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(4)], bob); 
      const { result } = simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(2)], alice); 

      expect(result).toBeOk(Cl.bool(true));
      
      const gameRes = simnet.callReadOnlyFn(CONTRACT_NAME, "get-game", [Cl.uint(0)], alice);
      expect(gameRes.result).toBeOk();
      const val: any = gameRes.result;
      expect(val.value).toBeSome();
    });
  });

  describe("Winning a Game (5x5 - 5-in-a-row)", () => {
    it("should detect 5-in-a-row win", () => {
      simnet.callPublicFn(CONTRACT_NAME, "create-game", [Cl.uint(1000000), Cl.uint(0), Cl.uint(5)], alice); 
      simnet.callPublicFn(CONTRACT_NAME, "join-game", [Cl.uint(0), Cl.uint(5)], bob); 
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(1)], alice); 
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(6)], bob); 
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(2)], alice); 
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(7)], bob); 
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(3)], alice); 
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(8)], bob); 
      const { result } = simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(4)], alice); 

      expect(result).toBeOk(Cl.bool(true));
      const gameRes = simnet.callReadOnlyFn(CONTRACT_NAME, "get-game", [Cl.uint(0)], alice);
      expect(gameRes.result).toBeOk();
      const val: any = gameRes.result;
      expect(val.value).toBeSome();
    });
  });

  describe("Player Stats and Leaderboard", () => {
    it("should track wins and earnings", () => {
      simnet.callPublicFn(CONTRACT_NAME, "create-game", [Cl.uint(1000000), Cl.uint(0), Cl.uint(3)], alice);
      simnet.callPublicFn(CONTRACT_NAME, "join-game", [Cl.uint(0), Cl.uint(3)], bob);
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(1)], alice);
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(4)], bob);
      simnet.callPublicFn(CONTRACT_NAME, "play", [Cl.uint(0), Cl.uint(2)], alice); 

      const statsRes = simnet.callReadOnlyFn(CONTRACT_NAME, "get-player-stats", [Cl.principal(alice)], alice);
      expect(statsRes.result).toBeOk(Cl.tuple({
        wins: Cl.uint(1),
        "total-earned": Cl.uint(2000000)
      }));
    });
  });
});
