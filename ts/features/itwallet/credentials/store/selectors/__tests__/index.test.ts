import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwCredentialByTypeSelector,
  itwCredentialsSelector,
  itwCredentialsEidSelector,
  itwCredentialsTypesSelector,
  itwHasWalletAtLeastTwoCredentialsSelector,
  itwIsWalletEmptySelector,
  selectFiscalCodeFromEid,
  selectNameSurnameFromEid
} from "../index";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import {
  ParsedCredential,
  StoredCredential
} from "../../../../common/utils/itwTypesUtils";

const getStateWithCredentials = (credentials: {
  [key: string]: Partial<StoredCredential>;
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

const mockedEid: StoredCredential = {
  credential: "",
  credentialType: CredentialType.PID,
  parsedCredential: {
    tax_id_code: {
      value: "AAAAAA00A00A000A",
      name: {
        "it-IT": "Codice Fiscale",
        "en-US": "Tax ID Number"
      }
    }
  },
  format: "vc+sd-jwt",
  keyTag: "9020c6f8-01be-4236-9b6f-834af9dcbc63",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  }
};

const mockedDrivingLicense: StoredCredential = {
  credential: "",
  credentialType: CredentialType.DRIVING_LICENSE,
  parsedCredential: {},
  format: "vc+sd-jwt",
  keyTag: "d191ad52-2674-46f3-9610-6eb7bd9146a3",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  }
};

const mockedDisabilityCard: StoredCredential = {
  credential: "",
  credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
  parsedCredential: {},
  format: "vc+sd-jwt",
  keyTag: "07ccc69a-d1b5-4c3c-9955-6a436d0c3710",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  }
};

describe("itwCredentialsEidSelector", () => {
  it("returns O.some with the eid ", () => {
    const state = getStateWithCredentials({
      [CredentialType.PID]: mockedEid,
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense
    });
    expect(itwCredentialsEidSelector(state)).toEqual(O.some(mockedEid));
  });

  it("returns O.none if the eid is not present", () => {
    const state = getStateWithCredentials({
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense
    });
    expect(itwCredentialsEidSelector(state)).toEqual(O.none);
  });
});

describe("itwCredentialsByTypeSelector", () => {
  it("returns the credentials by type from the global state", () => {
    const state = getStateWithCredentials({
      [CredentialType.PID]: mockedEid,
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense,
      [CredentialType.EUROPEAN_DISABILITY_CARD]: mockedDisabilityCard
    });
    expect(itwCredentialsSelector(state)).toEqual({
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense,
      [CredentialType.EUROPEAN_DISABILITY_CARD]: mockedDisabilityCard
    });
  });
});

describe("itwCredentialByTypeSelector", () => {
  it("returns the O.some with the credential if it exists", () => {
    const state = getStateWithCredentials({
      [CredentialType.PID]: mockedEid,
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense,
      [CredentialType.EUROPEAN_DISABILITY_CARD]: mockedDisabilityCard
    });
    expect(
      itwCredentialByTypeSelector(CredentialType.DRIVING_LICENSE)(state)
    ).toEqual(O.some(mockedDrivingLicense));
  });
  it("returns the O.none if the credential does not exist", () => {
    const state = getStateWithCredentials({
      [CredentialType.PID]: mockedEid,
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense,
      [CredentialType.EUROPEAN_DISABILITY_CARD]: mockedDisabilityCard
    });
    expect(
      itwCredentialByTypeSelector(
        CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
      )(state)
    ).toEqual(O.none);
  });
});

describe("itwCredentialsTypesSelector", () => {
  it("returns the types of the credentials", () => {
    const state = getStateWithCredentials({
      [CredentialType.PID]: mockedEid,
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense,
      [CredentialType.EUROPEAN_DISABILITY_CARD]: mockedDisabilityCard
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
      [CredentialType.PID]: mockedEid,
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense,
      [CredentialType.EUROPEAN_DISABILITY_CARD]: mockedDisabilityCard
    });
    expect(selectFiscalCodeFromEid(state)).toEqual("AAAAAA00A00A000A");
  });

  it("returns an empty string if the eid is not present", () => {
    const state = getStateWithCredentials({
      [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense,
      [CredentialType.EUROPEAN_DISABILITY_CARD]: mockedDisabilityCard
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
        [CredentialType.PID]: {
          ...mockedEid,
          parsedCredential: { ...parsedCredential } as ParsedCredential
        },
        [CredentialType.DRIVING_LICENSE]: mockedDrivingLicense,
        [CredentialType.EUROPEAN_DISABILITY_CARD]: mockedDisabilityCard
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
        [CredentialType.PID]: {
          credentialType: CredentialType.PID,
          credential: "123"
        }
      }
    ],
    [
      false,
      {
        [CredentialType.DRIVING_LICENSE]: {
          credentialType: CredentialType.DRIVING_LICENSE,
          credential: "123"
        }
      }
    ],
    [
      false,
      {
        [CredentialType.PID]: {
          credentialType: CredentialType.PID,
          credential: "123"
        },
        [CredentialType.DRIVING_LICENSE]: {
          credentialType: CredentialType.DRIVING_LICENSE,
          credential: "123"
        }
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
        [CredentialType.PID]: {
          credentialType: CredentialType.PID,
          credential: "123"
        }
      }
    ],
    [
      false,
      {
        [CredentialType.PID]: {
          credentialType: CredentialType.PID,
          credential: "123"
        },
        [CredentialType.DRIVING_LICENSE]: {
          credentialType: CredentialType.DRIVING_LICENSE,
          credential: "123"
        }
      }
    ],
    [
      true,
      {
        [CredentialType.PID]: {
          credentialType: CredentialType.PID,
          credential: "123"
        },
        [CredentialType.DRIVING_LICENSE]: {
          credentialType: CredentialType.DRIVING_LICENSE,
          credential: "123"
        },
        [CredentialType.EUROPEAN_DISABILITY_CARD]: {
          credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
          credential: "123"
        }
      }
    ]
  ])("returns %s when the credentials are %s", (expected, credentials) => {
    const state = getStateWithCredentials(credentials);
    expect(itwHasWalletAtLeastTwoCredentialsSelector(state)).toEqual(expected);
  });
});
