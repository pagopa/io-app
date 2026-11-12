import { PersistedState } from "redux-persist";

import { AUTH_LEVELS } from "../../../../../common/utils";
import { CIE_ENVS } from "../../../utils";
import {
  cieIDDisableTourGuide,
  cieIDSetSelectedSecurityLevel,
  setCieEnv
} from "../../actions";
import { cieLoginInitialState, testableCieLoginReducer } from "../cieLogin";

describe("cieLoginReducer", () => {
  if (!testableCieLoginReducer) {
    throw new Error("cieLoginReducer is not available in test environment");
  }
  const cieLoginReducer = testableCieLoginReducer.cieLoginReducer;

  it("should return initial state by default", () => {
    const result = cieLoginReducer(undefined, { type: "UNKNOWN" } as any);
    expect(result).toEqual(cieLoginInitialState);
  });

  it("should default the CIE environment to production", () => {
    expect(cieLoginInitialState.cieEnv).toBe(CIE_ENVS.PROD);
  });

  it.each([CIE_ENVS.PREPROD, CIE_ENVS.PROD])(
    "should set the CIE environment to $0",
    env => {
      const result = cieLoginReducer(
        { ...cieLoginInitialState, cieEnv: CIE_ENVS.PROD },
        setCieEnv(env)
      );
      expect(result.cieEnv).toBe(env);
    }
  );

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
