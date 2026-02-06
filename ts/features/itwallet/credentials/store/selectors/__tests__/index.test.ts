import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwCredentialSelector,
  itwCredentialsSelector,
  itwCredentialsEidSelector,
  itwCredentialsTypesSelector,
  itwHasWalletAtLeastTwoCredentialsSelector,
  itwIsWalletEmptySelector,
  selectFiscalCodeFromEid,
  selectNameSurnameFromEid,
  itwCredentialsByTypeSelector,
  itwCredentialsListByTypeSelector,
  itwHasExpiringCredentialsSelector,
  itwIsMdlPresentSelector
} from "../index";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import {
  ParsedCredential,
  CredentialMetadata
} from "../../../../common/utils/itwTypesUtils";

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
  }
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
  }
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
  }
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
  }
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
  it("returns O.some with the eid ", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense
    });
    expect(itwCredentialsEidSelector(state)).toEqual(O.some(mockedEid));
  });

  it("returns O.none if the eid is not present", () => {
    const state = getStateWithCredentials({
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense
    });
    expect(itwCredentialsEidSelector(state)).toEqual(O.none);
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
  it("returns the O.some with the credential if it exists", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(
      itwCredentialSelector(CredentialType.DRIVING_LICENSE)(state)
    ).toEqual(O.some(mockedDrivingLicense));
  });
  it("returns the O.none if the credential does not exist", () => {
    const state = getStateWithCredentials({
      [mockedEid.credentialId]: mockedEid,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard
    });
    expect(
      itwCredentialSelector(CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD)(
        state
      )
    ).toEqual(O.none);
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
  it("itwCredentialsEidSelector returns O.some with the eid ", () => {
    const legacyEid = { ...mockedEid, format: "vc+sd-jwt" };
    const state = getStateWithCredentials({
      [legacyEid.credentialId]: legacyEid
    });
    expect(itwCredentialsEidSelector(state)).toEqual(O.some(legacyEid));
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

describe("itwHasExpiringCredentialsSelector", () => {
  it("should return true when there is at least one expiring credential", () => {
    const state = getStateWithCredentials({
      [mockedDisabilityCard.credentialId]: mockedDisabilityCard,
      [mockedDrivingLicense.credentialId]: mockedDrivingLicense,
      [mockedMdocDrivingLicense.credentialId]: mockedMdocDrivingLicense
    });
    expect(itwHasExpiringCredentialsSelector(state)).toEqual(true);
  });

  it("should return false when all credentials are valid", () => {
    const state = getStateWithCredentials({
      [mockedDisabilityCard.credentialId]: {
        ...mockedDisabilityCard,
        jwt: {
          issuedAt: "2024-09-30T07:32:49.000Z",
          expiration: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString()
        }
      },
      [mockedDrivingLicense.credentialId]: {
        ...mockedDrivingLicense,
        jwt: {
          issuedAt: "2024-09-30T07:32:49.000Z",
          expiration: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString()
        }
      },
      [mockedMdocDrivingLicense.credentialId]: {
        ...mockedMdocDrivingLicense,
        jwt: {
          issuedAt: "2024-09-30T07:32:49.000Z",
          expiration: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString()
        }
      }
    });
    expect(itwHasExpiringCredentialsSelector(state)).toEqual(false);
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
