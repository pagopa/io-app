import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  setOneIdentityEnv,
  setOneIdentityLocalFeatureFlag
} from "../../actions/loginConfig";
import { OneIdentityEnv } from "../loginConfig";

describe("loginConfig reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.features.loginFeatures.loginConfig).toEqual(
      expect.objectContaining({
        oneIdentityLocalFeatureFlag: undefined,
        oneIdentityEnv: "prod"
      })
    );
  });

  it.each([true, false, undefined])(
    "should handle setOneIdentityLocalFeatureFlag action with %s",
    value => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(setOneIdentityLocalFeatureFlag(value));

      expect(
        store.getState().features.loginFeatures.loginConfig
          .oneIdentityLocalFeatureFlag
      ).toBe(value);
    }
  );

  it.each(["prod", "uat"] as ReadonlyArray<OneIdentityEnv>)(
    "should handle setOneIdentityEnv action with %s",
    value => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(setOneIdentityEnv(value));

      expect(
        store.getState().features.loginFeatures.loginConfig.oneIdentityEnv
      ).toBe(value);
    }
  );
});
