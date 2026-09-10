import { PersistedState } from "redux-persist";

import { AUTH_LEVELS } from "../../../../common/utils";
import {
  cieIDDisableTourGuide,
  cieIDSetSelectedSecurityLevel,
  cieLoginDisableUat,
  cieLoginEnableUat
} from "../actions";
import {
  cieLoginInitialState,
  testableCieLoginReducer
} from "../reducers/cieLogin";

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
    const authLevelL2 = AUTH_LEVELS.L2;
    const result = cieLoginReducer(
      cieLoginInitialState,
      cieIDSetSelectedSecurityLevel(authLevelL2)
    );
    expect(result.cieIDSelectedSecurityLevel).toBe(authLevelL2);
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
