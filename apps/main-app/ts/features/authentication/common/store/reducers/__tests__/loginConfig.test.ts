import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  setOneIdentityEnv,
  setOneIdentityLocalFeatureFlag
} from "../../actions/loginConfig";
import {
  CURRENT_REDUX_LOGIN_CONFIG_STORE_VERSION,
  OneIdentityEnv,
  persistConfig
} from "../loginConfig";

describe("loginConfig reducer", () => {
  it("should have the expected persist config", () => {
    expect(persistConfig.key).toBe("loginConfig");
    expect(persistConfig.version).toBe(
      CURRENT_REDUX_LOGIN_CONFIG_STORE_VERSION
    );
    expect(persistConfig.whitelist).toStrictEqual([
      "oneIdentityLocalFeatureFlag",
      "oneIdentityEnv"
    ]);
  });

  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.features.loginFeatures.loginConfig).toEqual({
      oneIdentityLocalFeatureFlag: undefined,
      oneIdentityEnv: "prod"
    });
  });

  it.each([true, false, undefined])(
    "should handle setOneIdentityLocalFeatureFlag action with %s",
    value => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(setOneIdentityLocalFeatureFlag(value));

      expect(store.getState().features.loginFeatures.loginConfig).toEqual({
        oneIdentityLocalFeatureFlag: value,
        oneIdentityEnv: "prod"
      });
    }
  );

  it.each(["prod", "uat"] as ReadonlyArray<OneIdentityEnv>)(
    "should handle setOneIdentityEnv action with %s",
    value => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(setOneIdentityEnv(value));

      expect(store.getState().features.loginFeatures.loginConfig).toEqual({
        oneIdentityLocalFeatureFlag: undefined,
        oneIdentityEnv: value
      });
    }
  );
});
