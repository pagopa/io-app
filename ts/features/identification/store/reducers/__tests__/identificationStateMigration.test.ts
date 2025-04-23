import MockDate from "mockdate";
import { PersistPartial } from "redux-persist";
import {
  IDENTIFICATION_STATE_MIGRATION_VERSION,
  identificationStateMigration
} from "../../../../../store/reducers";
import { IdentificationState } from "..";

MockDate.set(new Date("2024-03-13T10:30:20.000Z"));

const lastAttempt = new Date("2024-03-13T10:30:00.000Z");

// "progress" is in black list, so we need to omit it from the presisted state
type MockState = Omit<IdentificationState, "progress"> & PersistPartial;
// A mock of the state before the migration
const previousState: MockState = {
  _persist: {
    version: IDENTIFICATION_STATE_MIGRATION_VERSION - 1,
    rehydrated: true
  },
  fail: {
    nextLegalAttempt: lastAttempt,
    remainingAttempts: 7,
    timespanBetweenAttempts: 0
  }
};

describe("IdentificationStateMigration - Sanity Check", () => {
  it("should pass the sanity check", () => {
    const actualDate = new Date();
    const expectedDate = new Date("2024-03-13T10:30:20.000Z");
    expect(actualDate).toEqual(expectedDate);
  });
});

describe("IdentificationStateMigration", () => {
  it("should add showLockModal=false to fail object if fail exists and remainingAttempts > 3", () => {
    // Execute the migration
    const migratedState = identificationStateMigration["0"](
      previousState
    ) as MockState;

    // Assertions
    expect(migratedState).toHaveProperty("fail");
    if (migratedState.fail) {
      // TypeScript guard for type safety
      expect(migratedState.fail).toHaveProperty("showLockModal");
      // Validate showLockModal
      expect(migratedState.fail.showLockModal).toBe(false);
    }
  });

  it("should add showLockModal=true to fail object if fail exists and remainingAttempts <= 3", () => {
    // Setup state with undefined fail
    const prevStateThatShouldHaveShowLockSetToTrue: MockState = {
      ...previousState,
      fail: {
        nextLegalAttempt: lastAttempt,
        remainingAttempts: 3,
        timespanBetweenAttempts: 30
      }
    };

    // Execute the migration
    const migratedState = identificationStateMigration["0"](
      prevStateThatShouldHaveShowLockSetToTrue
    ) as MockState;

    // Assertions
    expect(migratedState).toHaveProperty("fail");
    if (migratedState.fail) {
      // TypeScript guard for type safety
      expect(migratedState.fail).toHaveProperty("showLockModal");
      // Validate showLockModal value
      expect(migratedState.fail.showLockModal).toBe(true);
    }
  });

  it("should handle cases where fail is undefined or null", () => {
    // Setup state with undefined fail
    const prevStateWithUndefinedFail: MockState = {
      ...previousState,
      fail: undefined
    };

    // Execute migration
    const migratedStateWithUndefinedFail = identificationStateMigration["0"](
      prevStateWithUndefinedFail
    ) as MockState;

    // Assertions for undefined fail
    expect(migratedStateWithUndefinedFail.fail).toBeUndefined();
  });
});
