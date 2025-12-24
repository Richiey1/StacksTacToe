import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

// Get test accounts from simnet
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

describe("StacksTacToe Game Contract - Basic Tests", () => {
  describe("Counter Functions (Test Placeholder)", () => {
    it("should initialize counter to 0", () => {
      const counter = simnet.getDataVar("stackstactoe-game", "counter");
      expect(counter).toBeUint(0);
    });

    it("should increment counter", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "increment-counter",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(1));

      const counter = simnet.getDataVar("stackstactoe-game", "counter");
      expect(counter).toBeUint(1);
    });

    it("should decrement counter", () => {
      // First increment to 2
      simnet.callPublicFn("stackstactoe-game", "increment-counter", [], deployer);
      simnet.callPublicFn("stackstactoe-game", "increment-counter", [], deployer);

      // Then decrement
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "decrement-counter",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(1));

      const counter = simnet.getDataVar("stackstactoe-game", "counter");
      expect(counter).toBeUint(1);
    });

    it("should not decrement below 0", () => {
      const { result } = simnet.callPublicFn(
        "stackstactoe-game",
        "decrement-counter",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));

      const counter = simnet.getDataVar("stackstactoe-game", "counter");
      expect(counter).toBeUint(0);
    });

    it("should get counter value", () => {
      const { result } = simnet.callReadOnlyFn(
        "stackstactoe-game",
        "get-counter",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });
  });
});
