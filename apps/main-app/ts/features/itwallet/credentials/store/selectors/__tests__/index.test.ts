import _ from "lodash";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import {
  CredentialMetadata,
  ParsedCredential
} from "../../../../common/utils/itwTypesUtils";
import {
  itwCredentialsByTypeSelector,
  itwCredentialsEidSelector,
  itwCredentialSelector,
  itwCredentialsListByTypeSelector,
  itwCredentialsSelector,
  itwCredentialsToRefillSelector,
  itwCredentialsTypesSelector,
  itwHasWalletAtLeastTwoCredentialsSelector,
  itwIsMdlPresentSelector,
  itwIsWalletEmptySelector,
  selectFiscalCodeFromEid,
  selectNameSurnameFromEid
} from "../index";

const getStateWithCredentials = (credentials: {
  [key: string]: Partial<CredentialMetadata>;
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

const mockedEid: CredentialMetadata = {
  credentialType: CredentialType.PID,
  credentialId: "dc_sd_jwt_PersonIdentificationData",
  parsedCredential: {
    tax_id_code: {
      value: "AAAAAA00A00A000A",
      name: {
        "it-IT": "Codice Fiscale",
        "en-US": "Tax ID Number"
      }
    }
  },
  format: "dc+sd-jwt",
  keyTag: "9020c6f8-01be-4236-9b6f-834af9dcbc63",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  },
  spec_version: "1.0.0"
};

const mockedDrivingLicense: CredentialMetadata = {
  credentialType: CredentialType.DRIVING_LICENSE,
  credentialId: "dc_sd_jwt_mDL",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "d191ad52-2674-46f3-9610-6eb7bd9146a3",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  },
  spec_version: "1.0.0"
};

const mockedMdocDrivingLicense: CredentialMetadata = {
  credentialType: CredentialType.DRIVING_LICENSE,
  credentialId: "mso_mdoc_mDL",
  parsedCredential: {},
  format: "mso_mdoc",
  keyTag: "d191ad52-2674-46f3-9610-6eb7bd9146a3",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  },
  spec_version: "1.0.0"
};

const mockedDisabilityCard: CredentialMetadata = {
  credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
  credentialId: "dc_sd_jwt_EuropeanDisabilityCard",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "07ccc69a-d1b5-4c3c-9955-6a436d0c3710",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  },
  spec_version: "1.0.0"
};

describe("itwCredentialsByTypeSelector", () => {
  it("aggregates by credential type", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedMdocDrivingLicense.credentialId]: mockedMdocDrivingLicense,
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(itwCredentialsByTypeSelector(state)).toEqual({
      [mockedEid.credentialType]: { "dc+sd-jwt": mockedEid },
      [mockedDrivingLicense.credentialType]: {
        "dc+sd-jwt": mockedDrivingLicense,
        mso_mdoc: mockedMdocDrivingLicense
      },
      [mockedDisabilityCard.credentialType]: {
        "dc+sd-jwt": mockedDisabilityCard
      }
    });
  });
});

describe("itwCredentialsEidSelector", () => {
  it("returns the eid", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense
    });
    expect(itwCredentialsEidSelector(state)).toEqual(mockedEid);
  });

  it("returns undefined if the eid is not present", () => {
    const state = getStateWithCredentials({
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense
    });
    expect(itwCredentialsEidSelector(state)).toBeUndefined();
  });
});

describe("itwCredentialsSelector", () => {
  it("returns the credentials by type from the global state", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(itwCredentialsSelector(state)).toEqual({
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense,
      [CredentialType.EUROPEAN_DISABILITY_CARD]: mockedDisabilityCard
    });
  });
});

describe("itwCredentialSelector", () => {
  it("returns the credential if it exists", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(
      itwCredentialSelector(CredentialType.DRIVING_LICENSE)(state)
    ).toEqual(mockedDrivingLicense);
  });
  it("returns undefined if the credential does not exist", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(
      itwCredentialSelector(CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD)(
        state
      )
    ).toBeUndefined();
  });
});

describe("itwCredentialsTypesSelector", () => {
  it("returns the types of the credentials", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard,
      ["other"]: mockedDisabilityCard
    });
    expect(itwCredentialsTypesSelector(state)).toEqual([
      CredentialType.DRIVING_LICENSE,
      CredentialType.EUROPEAN_DISABILITY_CARD
    ]);
  });
});

describe("selectFiscalCodeFromEid", () => {
  it("returns the fiscal code from the eid", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(selectFiscalCodeFromEid(state)).toEqual("AAAAAA00A00A000A");
  });

  it("returns an empty string if the eid is not present", () => {
    const state = getStateWithCredentials({
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(selectFiscalCodeFromEid(state)).toEqual("");
  });
});

describe("selectNameSurnameFromEid", () => {
  test.each([
    [
      "John Doe",
      {
        given_name: {
          value: "John"
        },
        family_name: {
          value: "Doe"
        }
      }
    ],
    [
      "John",
      {
        given_name: {
          value: "John"
        }
      }
    ],
    [
      "Doe",
      {
        family_name: {
          value: "Doe"
        }
      }
    ],
    ["", {}]
  ])(
    "returns %s when the parsed credential is %s",
    (expected, parsedCredential) => {
      const state = getStateWithCredentials({
        [mockedEid.credentialId]: {
          ...mockedEid,
          parsedCredential: { ...parsedCredential } as ParsedCredential
        },
        [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
        [mockedDisabilityCard.credentialId]: mockedDisabilityCard
      });

      expect(selectNameSurnameFromEid(state)).toEqual(expected);
    }
  );
});

describe("itwIsWalletEmptySelector", () => {
  test.each([
    [true, {}],
    [
      true,
      {
        [mockedEid.credentialId]: mockedEid
      }
    ],
    [
      false,
      {
        [mockedDrivingLicense.credentialId]: mockedDrivingLicense
      }
    ],
    [
      false,
      {
        [mockedEid.credentialId]: mockedEid,
        [mockedDrivingLicense.credentialId]: mockedDrivingLicense
      }
    ]
  ])("returns %s when the credentials are %s", (expected, credentials) => {
    const state = getStateWithCredentials(credentials);
    expect(itwIsWalletEmptySelector(state)).toEqual(expected);
  });
});

describe("itwHasWalletAtLeastTwoCredentialsSelector", () => {
  test.each([
    [false, {}],
    [
      false,
      {
        [mockedEid.credentialId]: mockedEid
      }
    ],
    [
      false,
      {
        [mockedEid.credentialId]: mockedEid,
        [mockedDrivingLicense.credentialId]: mockedDrivingLicense
      }
    ],
    [
      true,
      {
        [mockedEid.credentialId]: mockedEid,
        [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
        [mockedDisabilityCard.credentialId]: mockedDisabilityCard
      }
    ]
  ])("returns %s when the credentials are %s", (expected, credentials) => {
    const state = getStateWithCredentials(credentials);
    expect(itwHasWalletAtLeastTwoCredentialsSelector(state)).toEqual(expected);
  });
});

describe("test legacy credentials", () => {
  it("itwCredentialsEidSelector returns the eid", () => {
    const legacyEid = { ...mockedEid, format: "vc+sd-jwt" };
    const state = getStateWithCredentials({
      [legacyEid.credentialId]: legacyEid
    });
    expect(itwCredentialsEidSelector(state)).toEqual(legacyEid);
  });

  it("itwCredentialsSelector returns the legacy credentials", () => {
    const legacyEid = { ...mockedEid, format: "vc+sd-jwt" };
    const legacyMdl = { ...mockedDrivingLicense, format: "vc+sd-jwt" };
    const legacyDc = { ...mockedDisabilityCard, format: "vc+sd-jwt" };
    const state = getStateWithCredentials({
      [legacyEid.credentialId]: legacyEid,
      [legacyMdl.credentialId]: legacyMdl,
      [legacyDc.credentialId]: legacyDc
    });
    expect(itwCredentialsSelector(state)).toEqual({
      [CredentialType.DRIVING_LICENSE]: legacyMdl,
      [CredentialType.EUROPEAN_DISABILITY_CARD]: legacyDc
    });
  });
});

describe("itwCredentialsListByTypeSelector", () => {
  it("should return the list of all credentials of the same type", () => {
    const state = getStateWithCredentials({
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedMdocDrivingLicense.credentialId]: mockedMdocDrivingLicense
    });
    expect(
      itwCredentialsListByTypeSelector(CredentialType.DRIVING_LICENSE)(state)
    ).toEqual([mockedDrivingLicense, mockedMdocDrivingLicense]);
  });

  it("should return an empty list when no credentials are found", () => {
    const state = getStateWithCredentials({
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(
      itwCredentialsListByTypeSelector(CredentialType.DRIVING_LICENSE)(state)
    ).toEqual([]);
  });
});

describe("itwIsMdlPresentSelector", () => {
  it("should return true if there is mDL stored", () => {
    const state = getStateWithCredentials({
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedMdocDrivingLicense.credentialId]: mockedMdocDrivingLicense
    });
    expect(itwIsMdlPresentSelector(state)).toEqual(true);
  });

  it("should return false if there is not mDL stored", () => {
    const state = getStateWithCredentials({
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(itwIsMdlPresentSelector(state)).toEqual(false);
  });
});

describe("itwCredentialsToRefillSelector", () => {
  const makeProofOfAge = (keyTags: Array<string>): CredentialMetadata => ({
    ...mockedDrivingLicense,
    credentialType: CredentialType.PROOF_OF_AGE,
    credentialId: "dc_sd_jwt_proof_of_age",
    keyTag: keyTags[0],
    keyTags
  });

  it("should return the type of a batch credential at the refill threshold", () => {
    const proofOfAge = makeProofOfAge(["kt-1", "kt-2"]);
    const state = getStateWithCredentials({
      [proofOfAge.credentialId]: proofOfAge
    });
    expect(itwCredentialsToRefillSelector(state)).toEqual([
      CredentialType.PROOF_OF_AGE
    ]);
  });

  it("should not return a batch credential above the refill threshold", () => {
    const proofOfAge = makeProofOfAge(["kt-1", "kt-2", "kt-3"]);
    const state = getStateWithCredentials({
      [proofOfAge.credentialId]: proofOfAge
    });
    expect(itwCredentialsToRefillSelector(state)).toEqual([]);
  });

  it("should not return credentials that are not obtained in batch", () => {
    const state = getStateWithCredentials({
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense
    });
    expect(itwCredentialsToRefillSelector(state)).toEqual([]);
  });

  it("should deduplicate the same credential type stored in multiple formats", () => {
    const sdJwt = makeProofOfAge(["kt-1"]);
    const mdoc = { ...sdJwt, credentialId: "mso_mdoc_proof_of_age" };
    const state = getStateWithCredentials({
      [sdJwt.credentialId]: sdJwt,
      [mdoc.credentialId]: mdoc
    });
    expect(itwCredentialsToRefillSelector(state)).toEqual([
      CredentialType.PROOF_OF_AGE
    ]);
  });
});
