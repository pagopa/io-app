import _ from "lodash";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import {
  buildItwBaseProperties,
  buildThirdPartyCredentialProperty,
  buildWalletListCredentialProperty,
  computeItwStatus
} from "../basePropertyBuilder";

const expirationClaim = { value: "2100-09-04", name: "exp" };
const jwtExpiration = "2100-09-04T00:00:00.000Z";

const getStateWithCredentials = (
  credentials: {
    [key: string]: CredentialMetadata;
  },
  credentialUpgradeFailed?: ReadonlyArray<string>
) => {
  const defaultState = appReducer(undefined, applicationChangeState("active"));
  return _.merge(undefined, defaultState, {
    features: {
      itWallet: {
        credentials: {
          credentials
        },
        preferences: {
          credentialUpgradeFailed
        }
      }
    }
  });
};

const getMockedCredential = (
  credentialType: CredentialType,
  overrides: Partial<CredentialMetadata> = {}
): CredentialMetadata => {
  const credentialId = `dc_sd_jwt_${credentialType}`;

  return {
    credentialType,
    credentialId,
    parsedCredential: {
      expiry_date: expirationClaim
    },
    format: "dc+sd-jwt",
    keyTag: `key-${credentialType}`,
    issuerConf: {} as CredentialMetadata["issuerConf"],
    jwt: {
      issuedAt: "2024-09-30T07:32:49.000Z",
      expiration: jwtExpiration
    },
    spec_version: "1.0.0",
    ...overrides
  };
};

describe("buildItwBaseProperties", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("includes V2 and V3 properties when IT-Wallet is inactive", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);

    const state = appReducer(undefined, applicationChangeState("active"));
    const result = buildItwBaseProperties(state);

    expect(result).toHaveProperty("ITW_ID_V2");
    expect(result).toHaveProperty("ITW_PG_V2");
    expect(result).toHaveProperty("ITW_PG_V3");
  });

  it("includes only V3 properties when IT Wallet is active", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    const state = appReducer(undefined, applicationChangeState("active"));
    const result = buildItwBaseProperties(state);

    expect(result).toHaveProperty("ITW_PG_V3");
    expect(Object.keys(result)).not.toEqual(
      expect.arrayContaining([
        "ITW_ID_V2",
        "ITW_PG_V2",
        "ITW_TS_V2",
        "ITW_CED_V2"
      ])
    );
  });
});

describe("buildThirdPartyCredentialProperty", () => {
  it("returns not_available when no third-party credential is present", () => {
    const state = getStateWithCredentials({});

    expect(buildThirdPartyCredentialProperty(state)).toBe("not_available");
  });

  it("returns valid when at least one credential obtained via credential offer is valid", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE, {
      origin: "credentialOffer"
    });
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildThirdPartyCredentialProperty(state)).toBe("valid");
  });

  it("returns not_valid when credentials obtained via credential offer are present but none are valid", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE, {
      origin: "credentialOffer",
      validity: {
        type: "status_assertion",
        status: "invalid"
      }
    });
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildThirdPartyCredentialProperty(state)).toBe("not_valid");
  });

  it("does not consider a credential obtained via the catalogue as a third-party credential", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE, {
      origin: "catalogue"
    });
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildThirdPartyCredentialProperty(state)).toBe("not_available");
  });
});

describe("buildWalletListCredentialProperty", () => {
  it("returns not_available when no catalogue credential is present", () => {
    const state = getStateWithCredentials({});

    expect(buildWalletListCredentialProperty(state)).toBe("not_available");
  });

  // Credentials whose channel is unknown (e.g. stored without origin by older
  // app versions) are attributed to the wallet list, never to the third-party channel
  test.each([
    { name: "valid", validity: undefined, expected: "valid" },
    {
      name: "not valid",
      validity: { type: "status_assertion", status: "invalid" } as const,
      expected: "not_valid"
    }
  ])(
    "attributes a $name credential with unknown origin to the wallet list",
    ({ validity, expected }) => {
      const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE, {
        validity
      });
      const state = getStateWithCredentials({
        [credential.credentialId]: credential
      });

      expect(buildWalletListCredentialProperty(state)).toBe(expected);
      expect(buildThirdPartyCredentialProperty(state)).toBe("not_available");
    }
  );

  it("returns valid when at least one credential obtained via the catalogue is valid", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE, {
      origin: "catalogue"
    });
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildWalletListCredentialProperty(state)).toBe("valid");
  });

  it("returns not_valid when credentials obtained via the catalogue are present but none are valid", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE, {
      origin: "catalogue",
      validity: {
        type: "status_assertion",
        status: "invalid"
      }
    });
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildWalletListCredentialProperty(state)).toBe("not_valid");
  });

  it("does not consider a credential obtained via credential offer as a wallet list credential", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE, {
      origin: "credentialOffer"
    });
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildWalletListCredentialProperty(state)).toBe("not_available");
  });

  it("does not consider PID as a wallet list credential", () => {
    const pid = getMockedCredential(CredentialType.PID, {
      origin: "catalogue"
    });
    const state = getStateWithCredentials({
      [pid.credentialId]: pid
    });

    expect(buildWalletListCredentialProperty(state)).toBe("not_available");
  });

  it("differs from third-party tracking for the same credential type obtained via different flows", () => {
    const catalogueCredential = getMockedCredential(
      CredentialType.EDUCATION_DEGREE,
      { origin: "catalogue" }
    );
    const state = getStateWithCredentials({
      [catalogueCredential.credentialId]: catalogueCredential
    });

    expect(buildThirdPartyCredentialProperty(state)).toBe("not_available");
    expect(buildWalletListCredentialProperty(state)).toBe("valid");
  });
});
describe("Documenti su IO aggregate credential properties", () => {
  const scenarios = [
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    CredentialType.EUROPEAN_DISABILITY_CARD
  ].flatMap(credentialType =>
    (["catalogue", "credentialOffer"] as const).flatMap(origin =>
      (["valid", "invalid"] as const).map(status => ({
        name: `${credentialType} from ${origin} with ${status} status`,
        credentialType,
        origin,
        status
      }))
    )
  );

  it.each(scenarios)(
    "tracks $name without IT-Wallet activation",
    ({ credentialType, origin, status }) => {
      const credential = getMockedCredential(credentialType, {
        origin,
        validity:
          status === "invalid"
            ? { type: "status_assertion", status }
            : undefined
      });
      const state = getStateWithCredentials({
        [credential.credentialId]: credential
      });
      const expectedStatus = status === "valid" ? "valid" : "not_valid";

      expect(buildItwBaseProperties(state)).toMatchObject({
        ITW_THIRD_PARTY_CREDENTIAL:
          origin === "credentialOffer" ? expectedStatus : "not_available",
        ITW_WALLET_LIST_CREDENTIAL:
          origin === "catalogue" ? expectedStatus : "not_available"
      });
    }
  );
});

describe("aggregate credential properties with credentials that need the IT-Wallet upgrade", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mdlFromCatalogue = getMockedCredential(CredentialType.DRIVING_LICENSE, {
    origin: "catalogue"
  });
  const tsFromCatalogue = getMockedCredential(
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    { origin: "catalogue" }
  );
  const mdlFromOffer = getMockedCredential(CredentialType.DRIVING_LICENSE, {
    origin: "credentialOffer"
  });

  test.each([
    {
      name: "the only wallet list credential failed the upgrade",
      credentials: [mdlFromCatalogue],
      failed: [CredentialType.DRIVING_LICENSE],
      expectedWalletList: "not_valid",
      expectedThirdParty: "not_available"
    },
    {
      name: "one wallet list credential failed the upgrade and another one is valid",
      credentials: [mdlFromCatalogue, tsFromCatalogue],
      failed: [CredentialType.DRIVING_LICENSE],
      expectedWalletList: "valid",
      expectedThirdParty: "not_available"
    },
    {
      name: "all wallet list credentials failed the upgrade",
      credentials: [mdlFromCatalogue, tsFromCatalogue],
      failed: [
        CredentialType.DRIVING_LICENSE,
        CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
      ],
      expectedWalletList: "not_valid",
      expectedThirdParty: "not_available"
    },
    {
      name: "the only third-party credential failed the upgrade",
      credentials: [mdlFromOffer],
      failed: [CredentialType.DRIVING_LICENSE],
      expectedWalletList: "not_available",
      expectedThirdParty: "not_valid"
    }
  ])(
    "returns wallet list $expectedWalletList and third-party $expectedThirdParty when $name",
    ({ credentials, failed, expectedWalletList, expectedThirdParty }) => {
      const state = getStateWithCredentials(
        Object.fromEntries(credentials.map(c => [c.credentialId, c])),
        failed
      );

      expect(buildWalletListCredentialProperty(state)).toBe(expectedWalletList);
      expect(buildThirdPartyCredentialProperty(state)).toBe(expectedThirdParty);
    }
  );

  it("does not count as valid a credential issued before the IT-Wallet PID, i.e. not upgraded yet", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);
    const pid = getMockedCredential(CredentialType.PID, {
      jwt: { issuedAt: "2025-01-01T00:00:00.000Z", expiration: jwtExpiration }
    });
    const state = getStateWithCredentials({
      [pid.credentialId]: pid,
      [mdlFromCatalogue.credentialId]: mdlFromCatalogue
    });

    expect(buildWalletListCredentialProperty(state)).toBe("not_valid");
  });
});

describe("computeItwStatus", () => {
  it.each`
    scenario                                        | authLevel    | identificationMode | isItwL3  | expected
    ${"not_active when authLevel is undefined"}     | ${undefined} | ${undefined}       | ${false} | ${"not_active"}
    ${"L2 for Documenti su IO with SPID/CieID"}     | ${"L2"}      | ${undefined}       | ${false} | ${"L2"}
    ${"L3 for Documenti su IO with CIE+PIN"}        | ${"L3"}      | ${undefined}       | ${false} | ${"L3"}
    ${"L2+ (spid_can) for IT-Wallet with SPID"}     | ${"L2"}      | ${"spid"}          | ${true}  | ${"L2+ (spid_can)"}
    ${"L3 (cieid_can) for IT-Wallet with CieID L2"} | ${"L2"}      | ${"cieId"}         | ${true}  | ${"L3 (cieid_can)"}
    ${"L3 (cieid_pin) for IT-Wallet with CieID L3"} | ${"L3"}      | ${"cieId"}         | ${true}  | ${"L3 (cieid_pin)"}
    ${"L3 (cie_pin) for IT-Wallet with CIE+PIN"}    | ${"L3"}      | ${"ciePin"}        | ${true}  | ${"L3 (cie_pin)"}
    ${"L3 fallback for existing IT-Wallet users"}   | ${"L3"}      | ${undefined}       | ${true}  | ${"L3"}
    ${"L2 fallback for existing IT-Wallet users"}   | ${"L2"}      | ${undefined}       | ${true}  | ${"L2"}
  `(
    "returns $expected when $scenario",
    ({ authLevel, identificationMode, isItwL3, expected }) => {
      expect(computeItwStatus(authLevel, identificationMode, isItwL3)).toBe(
        expected
      );
    }
  );
});
