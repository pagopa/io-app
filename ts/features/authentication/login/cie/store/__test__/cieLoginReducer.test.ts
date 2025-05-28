import { PersistedState } from "redux-persist";
import {
  cieLoginInitialState,
  testableCieLoginReducer
} from "../reducers/cieLogin";
import {
  cieLoginDisableUat,
  cieLoginEnableUat,
  cieIDDisableTourGuide,
  cieIDSetSelectedSecurityLevel
} from "../actions";

describe("cieLoginReducer", () => {
  if (!testableCieLoginReducer) {
    throw new Error("cieLoginReducer is not available in test environment");
  }
  const cieLoginReducer = testableCieLoginReducer.cieLoginReducer;

  it("should return initial state by default", () => {
    const result = cieLoginReducer(undefined, { type: "UNKNOWN" } as any);
    expect(result).toEqual(cieLoginInitialState);
  });

  it("should enable UAT mode", () => {
    const result = cieLoginReducer(cieLoginInitialState, cieLoginEnableUat());
    expect(result.useUat).toBe(true);
  });

  it("should disable UAT mode", () => {
    const initialState = { ...cieLoginInitialState, useUat: true };
    const result = cieLoginReducer(initialState, cieLoginDisableUat());
    expect(result.useUat).toBe(false);
  });

  it("should disable CIEID tour guide", () => {
    const result = cieLoginReducer(
      cieLoginInitialState,
      cieIDDisableTourGuide()
    );
    expect(result.isCieIDTourGuideEnabled).toBe(false);
  });

  it("should set selected security level", () => {
    const level = "SpidL2";
    const result = cieLoginReducer(
      cieLoginInitialState,
      cieIDSetSelectedSecurityLevel(level)
    );
    expect(result.cieIDSelectedSecurityLevel).toBe(level);
  });
});

describe("cieLogin migrations", () => {
  if (!testableCieLoginReducer) {
    throw new Error("cieLoginReducer is not available in test environment");
  }
  const migrations = testableCieLoginReducer.migrations;

  it("should set `isCieIDTourGuideEnabled` to true in version 0", () => {
    const state = {};
    expect(migrations["0"](state)).toEqual({ isCieIDTourGuideEnabled: true });
  });

  it("should remove `isCieIDFeatureEnabled` from state in version 1", () => {
    const state = {
      isCieIDFeatureEnabled: false,
      otherKey: 123
    } as PersistedState;
    expect(migrations["1"](state)).toEqual({ otherKey: 123 });
  });
});
