import { OneIdentityConfig } from "@io-app/api-types/generated/definitions/content/OneIdentityConfig";
import * as O from "fp-ts/lib/Option";

import { GlobalState } from "../../../../../../store/reducers/types";
import { OneIdentityEnv } from "../../reducers/loginConfig";
import {
  oneIdentityIdpsUrlSelector,
  oneIdentityRolloutPercentageSelector,
  testable
} from "../remoteConfig";

const { FALLBACK_ONE_IDENTITY_IDPS_URLS } = testable!;

const makeState = (
  oneIdentity?: OneIdentityConfig,
  oneIdentityEnv: OneIdentityEnv = "prod"
): GlobalState =>
  ({
    remoteConfig: oneIdentity === undefined ? O.none : O.some({ oneIdentity }),
    features: {
      loginFeatures: {
        loginConfig: {
          oneIdentityEnv
        }
      }
    }
  }) as GlobalState;

describe("oneIdentityRolloutPercentageSelector", () => {
  it("should return 0 when remoteConfig is none", () => {
    expect(oneIdentityRolloutPercentageSelector(makeState())).toBe(0);
  });

  it("should return 0 when rolloutPercentage is absent", () => {
    expect(oneIdentityRolloutPercentageSelector(makeState({}))).toBe(0);
  });

  it("should return the remote rolloutPercentage when present", () => {
    expect(
      oneIdentityRolloutPercentageSelector(makeState({ rolloutPercentage: 75 }))
    ).toBe(75);
  });
});

describe("oneIdentityIdpsUrlSelector", () => {
  const remoteProdUrl = "https://remote-prod.example.com/idps";
  const remoteUatUrl = "https://remote-uat.example.com/idps";

  const scenarios = [
    {
      name: "remoteConfig is none",
      statePayload: undefined,
      env: "prod",
      expected: FALLBACK_ONE_IDENTITY_IDPS_URLS.prod
    },
    {
      name: "remoteConfig is none",
      statePayload: undefined,
      env: "uat",
      expected: FALLBACK_ONE_IDENTITY_IDPS_URLS.uat
    },
    {
      name: "environments is absent",
      statePayload: {},
      env: "prod",
      expected: FALLBACK_ONE_IDENTITY_IDPS_URLS.prod
    },
    {
      name: "environments is absent",
      statePayload: {},
      env: "uat",
      expected: FALLBACK_ONE_IDENTITY_IDPS_URLS.uat
    },
    {
      name: "the environment is empty",
      statePayload: { environments: { prod: {} } },
      env: "prod",
      expected: FALLBACK_ONE_IDENTITY_IDPS_URLS.prod
    },
    {
      name: "the environment is empty",
      statePayload: { environments: { uat: {} } },
      env: "uat",
      expected: FALLBACK_ONE_IDENTITY_IDPS_URLS.uat
    },
    {
      name: "the remote idpsUrl is present",
      statePayload: { environments: { prod: { idpsUrl: remoteProdUrl } } },
      env: "prod",
      expected: remoteProdUrl
    },
    {
      name: "the remote idpsUrl is present",
      statePayload: { environments: { uat: { idpsUrl: remoteUatUrl } } },
      env: "uat",
      expected: remoteUatUrl
    }
  ];

  it.each(scenarios)(
    "should return the expected url when $name for '$env' env",
    ({ statePayload, env, expected }) => {
      expect(
        oneIdentityIdpsUrlSelector(
          makeState(statePayload, env as OneIdentityEnv)
        )
      ).toBe(expected);
    }
  );

  it("should have the expected hardcoded fallback URLs", () => {
    expect(FALLBACK_ONE_IDENTITY_IDPS_URLS).toEqual({
      prod: "https://io.oneid.pagopa.it/idps",
      uat: "https://uat.io.oneid.pagopa.it/idps"
    });
  });
});
