import * as O from "fp-ts/lib/Option";

import { GlobalState } from "../../../../../../store/reducers/types";
import {
  LoginConfigState,
  ONE_IDENTITY_ENVS
} from "../../reducers/loginConfig";
import {
  isOneIdentityLoginEnabledSelector,
  oneIdentityEnvSelector,
  oneIdentityLocalFeatureFlagSelector
} from "../loginConfig";

jest.mock("../../../../../../utils/device", () => ({
  getDeviceId: () => "test-device-id"
}));

const makeState = (
  loginConfig: LoginConfigState,
  rolloutPercentage?: number
): GlobalState =>
  ({
    features: { loginFeatures: { loginConfig } },
    remoteConfig:
      rolloutPercentage === undefined
        ? O.none
        : O.some({ oneIdentity: { rolloutPercentage } })
  }) as GlobalState;

describe("oneIdentityLocalFeatureFlagSelector", () => {
  it.each([true, false, undefined])(
    "should return %s as the local feature flag value",
    value => {
      const state = makeState({
        oneIdentityLocalFeatureFlag: value,
        oneIdentityEnv: ONE_IDENTITY_ENVS.PROD
      });
      expect(oneIdentityLocalFeatureFlagSelector(state)).toBe(value);
    }
  );
});

describe("oneIdentityEnvSelector", () => {
  it.each([ONE_IDENTITY_ENVS.PROD, ONE_IDENTITY_ENVS.UAT])(
    "should return %s as the OneIdentity environment",
    value => {
      const state = makeState({
        oneIdentityLocalFeatureFlag: undefined,
        oneIdentityEnv: value
      });
      expect(oneIdentityEnvSelector(state)).toBe(value);
    }
  );
});

describe("isOneIdentityLoginEnabledSelector", () => {
  const scenarios = [
    {
      name: "the local feature flag is true, ignoring a 0% rollout",
      oneIdentityLocalFeatureFlag: true,
      rolloutPercentage: 0,
      expected: true
    },
    {
      name: "the local feature flag is false, ignoring a 100% rollout",
      oneIdentityLocalFeatureFlag: false,
      rolloutPercentage: 100,
      expected: false
    },
    {
      name: "the local feature flag is undefined and the rollout percentage is 0%",
      oneIdentityLocalFeatureFlag: undefined,
      rolloutPercentage: 0,
      expected: false
    },
    {
      name: "the local feature flag is undefined and the rollout percentage is 100%",
      oneIdentityLocalFeatureFlag: undefined,
      rolloutPercentage: 100,
      expected: true
    },
    {
      name: "the local feature flag is undefined and the remote config isn't loaded",
      oneIdentityLocalFeatureFlag: undefined,
      rolloutPercentage: undefined,
      expected: false
    }
  ];

  test.each(scenarios)(
    "should return $expected when $name",
    ({ oneIdentityLocalFeatureFlag, rolloutPercentage, expected }) => {
      const state = makeState(
        { oneIdentityLocalFeatureFlag, oneIdentityEnv: ONE_IDENTITY_ENVS.PROD },
        rolloutPercentage
      );
      expect(isOneIdentityLoginEnabledSelector(state)).toBe(expected);
    }
  );
});
