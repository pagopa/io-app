import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import {
  CredentialType,
  ItwCredentialFromCatalogueMocks
} from "../../../common/utils/itwMocksUtils";
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
const educationDegreeCatalogueCredential = {
  ...ItwCredentialFromCatalogueMocks,
  credential_type: CredentialType.EDUCATION_DEGREE
};

const getStateWithCredentials = (credentials: {
  [key: string]: CredentialMetadata;
}) => {
  const defaultState = appReducer(undefined, applicationChangeState("active"));
  return _.merge(undefined, defaultState, {
    features: {
      itWallet: {
        credentials: {
          credentials
        }
      }
    }
  });
};

const getStateWithCredentialsAndCatalogue = (credentials: {
  [key: string]: CredentialMetadata;
}) => {
  const defaultState = getStateWithCredentials(credentials);
  return _.merge(undefined, defaultState, {
    features: {
      itWallet: {
        credentialsCatalogue: {
          catalogue: pot.some({
            exp: 4102444800,
            credentials: [educationDegreeCatalogueCredential]
          })
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

  it("returns valid when at least one third-party credential is valid", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE);
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildThirdPartyCredentialProperty(state)).toBe("valid");
  });

  it("returns not_valid when third-party credentials are present but none are valid", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE, {
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

  it("does not consider historical L2 credentials as third-party credentials", () => {
    const credential = getMockedCredential(CredentialType.DRIVING_LICENSE);
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildThirdPartyCredentialProperty(state)).toBe("not_available");
  });
});

describe("buildWalletListCredentialProperty", () => {
  it("returns not_available when the catalogue is not available", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE);
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildWalletListCredentialProperty(state)).toBe("not_available");
  });

  it("returns valid when at least one catalogue credential is valid", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE);
    const state = getStateWithCredentialsAndCatalogue({
      [credential.credentialId]: credential
    });

    expect(buildWalletListCredentialProperty(state)).toBe("valid");
  });

  it("returns not_valid when catalogue credentials are present but none are valid", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE, {
      validity: {
        type: "status_assertion",
        status: "invalid"
      }
    });
    const state = getStateWithCredentialsAndCatalogue({
      [credential.credentialId]: credential
    });

    expect(buildWalletListCredentialProperty(state)).toBe("not_valid");
  });

  it("does not consider PID or historical L2 credentials as wallet list credentials", () => {
    const pid = getMockedCredential(CredentialType.PID);
    const l2Credential = getMockedCredential(CredentialType.DRIVING_LICENSE);
    const state = getStateWithCredentialsAndCatalogue({
      [pid.credentialId]: pid,
      [l2Credential.credentialId]: l2Credential
    });

    expect(buildWalletListCredentialProperty(state)).toBe("not_available");
  });

  it("differs from third-party tracking for new credentials not present in the catalogue", () => {
    const credential = getMockedCredential(CredentialType.EDUCATION_DEGREE);
    const state = getStateWithCredentials({
      [credential.credentialId]: credential
    });

    expect(buildThirdPartyCredentialProperty(state)).toBe("valid");
    expect(buildWalletListCredentialProperty(state)).toBe("not_available");
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
