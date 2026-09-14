import { OneIdentityConfig } from "@io-app/api-types/generated/definitions/content/OneIdentityConfig";
import * as O from "fp-ts/lib/Option";

import { GlobalState } from "../../../../../../store/reducers/types";
import { ONE_IDENTITY_ENVS, OneIdentityEnv } from "../../reducers/loginConfig";
import {
  oneIdentityIdpFriendlyNamesUrlSelector,
  oneIdentityIdpsUrlSelector,
  oneIdentityRolloutPercentageSelector,
  testable
} from "../remoteConfig";

const { FALLBACK_ONE_IDENTITY_CONFIG } = testable!;

const makeState = (
  oneIdentity?: OneIdentityConfig,
  oneIdentityEnv: OneIdentityEnv = ONE_IDENTITY_ENVS.PROD
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
      env: ONE_IDENTITY_ENVS.PROD,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.prod.idpsUrl
    },
    {
      name: "remoteConfig is none",
      statePayload: undefined,
      env: ONE_IDENTITY_ENVS.UAT,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.uat.idpsUrl
    },
    {
      name: "environments is absent",
      statePayload: {},
      env: ONE_IDENTITY_ENVS.PROD,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.prod.idpsUrl
    },
    {
      name: "environments is absent",
      statePayload: {},
      env: ONE_IDENTITY_ENVS.UAT,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.uat.idpsUrl
    },
    {
      name: "the environment is empty",
      statePayload: { environments: { prod: {} } },
      env: ONE_IDENTITY_ENVS.PROD,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.prod.idpsUrl
    },
    {
      name: "the environment is empty",
      statePayload: { environments: { uat: {} } },
      env: ONE_IDENTITY_ENVS.UAT,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.uat.idpsUrl
    },
    {
      name: "the remote idpsUrl is present",
      statePayload: { environments: { prod: { idpsUrl: remoteProdUrl } } },
      env: ONE_IDENTITY_ENVS.PROD,
      expected: remoteProdUrl
    },
    {
      name: "the remote idpsUrl is present",
      statePayload: { environments: { uat: { idpsUrl: remoteUatUrl } } },
      env: ONE_IDENTITY_ENVS.UAT,
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
});

describe("oneIdentityIdpFriendlyNamesUrlSelector", () => {
  const remoteProdUrl = "https://remote-prod.example.com/idpFriendlyNames.json";
  const remoteUatUrl = "https://remote-uat.example.com/idpFriendlyNames.json";

  const scenarios = [
    {
      name: "remoteConfig is none",
      statePayload: undefined,
      env: ONE_IDENTITY_ENVS.PROD,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.prod.idpFriendlyNamesUrl
    },
    {
      name: "remoteConfig is none",
      statePayload: undefined,
      env: ONE_IDENTITY_ENVS.UAT,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.uat.idpFriendlyNamesUrl
    },
    {
      name: "environments is absent",
      statePayload: {},
      env: ONE_IDENTITY_ENVS.PROD,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.prod.idpFriendlyNamesUrl
    },
    {
      name: "environments is absent",
      statePayload: {},
      env: ONE_IDENTITY_ENVS.UAT,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.uat.idpFriendlyNamesUrl
    },
    {
      name: "the environment is empty",
      statePayload: { environments: { prod: {} } },
      env: ONE_IDENTITY_ENVS.PROD,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.prod.idpFriendlyNamesUrl
    },
    {
      name: "the environment is empty",
      statePayload: { environments: { uat: {} } },
      env: ONE_IDENTITY_ENVS.UAT,
      expected: FALLBACK_ONE_IDENTITY_CONFIG.uat.idpFriendlyNamesUrl
    },
    {
      name: "the remote idpFriendlyNamesUrl is present",
      statePayload: {
        environments: { prod: { idpFriendlyNamesUrl: remoteProdUrl } }
      },
      env: ONE_IDENTITY_ENVS.PROD,
      expected: remoteProdUrl
    },
    {
      name: "the remote idpFriendlyNamesUrl is present",
      statePayload: {
        environments: { uat: { idpFriendlyNamesUrl: remoteUatUrl } }
      },
      env: ONE_IDENTITY_ENVS.UAT,
      expected: remoteUatUrl
    }
  ];

  it.each(scenarios)(
    "should return the expected url when $name for '$env' env",
    ({ statePayload, env, expected }) => {
      expect(
        oneIdentityIdpFriendlyNamesUrlSelector(
          makeState(statePayload, env as OneIdentityEnv)
        )
      ).toBe(expected);
    }
  );
});

describe("Fallback Configuration", () => {
  it("should have the expected hardcoded fallback URLs", () => {
    expect(FALLBACK_ONE_IDENTITY_CONFIG).toEqual({
      prod: {
        idpsUrl: "https://io.oneid.pagopa.it/idps",
        idpFriendlyNamesUrl:
          "https://assets.io.oneid.pagopa.it/assets/idpFriendlyNameList.json"
      },
      uat: {
        idpsUrl: "https://uat.io.oneid.pagopa.it/idps",
        idpFriendlyNamesUrl:
          "https://assets.uat.io.oneid.pagopa.it/assets/idpFriendlyNameList.json"
      }
    });
  });
});
