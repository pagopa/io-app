import _ from "lodash";
import { Mdoc, SdJwt } from "@pagopa/io-react-native-wallet";
import { itwCredentialsStateMigrations } from "../migrations";
import { WALLET_SPEC_VERSION } from "../../../../common/utils/constants";

jest.mock("@pagopa/io-react-native-wallet");
jest.mock("../../../../common/utils/constants", () => ({
  WALLET_SPEC_VERSION: "1.0.0"
}));

describe("ITW credentials reducer migrations", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should migrate from 0 to 1", () => {
    const basePersistedGlobalStateAt0 = {
      eid: { _tag: "Some", value: {} },
      credentials: [
        { _tag: "Some", value: {} },
        { _tag: "Some", value: {} },
        { _tag: "None" }
      ],
      _persist: {
        version: 0,
        rehydrated: false
      }
    };
    const persistedStateAt1 = _.merge(undefined, basePersistedGlobalStateAt0, {
      eid: { _tag: "Some", value: { storedStatusAttestation: undefined } },
      credentials: [
        { _tag: "Some", value: { storedStatusAttestation: undefined } },
        { _tag: "Some", value: { storedStatusAttestation: undefined } },
        { _tag: "None" }
      ]
    });

    const from0To1Migration = itwCredentialsStateMigrations[0];
    expect(from0To1Migration).toBeDefined();
    const nextState = from0To1Migration(basePersistedGlobalStateAt0);

    expect(nextState).toStrictEqual(persistedStateAt1);
  });

  it("should migrate from 1 to 2", () => {
    jest.spyOn(SdJwt, "decode").mockReturnValue({
      disclosures: [{ decoded: ["", "iat", 1718132000] }],
      sdJwt: {
        payload: {
          exp: 1718192000
        }
      }
    } as any);

    const basePersistedGlobalStateAt1 = {
      eid: { _tag: "Some", value: { storedStatusAttestation: undefined } },
      credentials: [
        { _tag: "Some", value: { storedStatusAttestation: undefined } },
        { _tag: "Some", value: { storedStatusAttestation: undefined } },
        { _tag: "None" }
      ],
      _persist: {
        version: 0,
        rehydrated: false
      }
    };
    const persistedStateAt2 = _.merge(undefined, basePersistedGlobalStateAt1, {
      eid: {
        _tag: "Some",
        value: {
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      credentials: [
        {
          _tag: "Some",
          value: {
            storedStatusAttestation: undefined,
            jwt: {
              expiration: "2024-06-12T11:33:20.000Z",
              issuedAt: "2024-06-11T18:53:20.000Z"
            }
          }
        },
        {
          _tag: "Some",
          value: {
            storedStatusAttestation: undefined,
            jwt: {
              expiration: "2024-06-12T11:33:20.000Z",
              issuedAt: "2024-06-11T18:53:20.000Z"
            }
          }
        },
        { _tag: "None" }
      ]
    });

    const from1To2Migration = itwCredentialsStateMigrations[1];
    expect(from1To2Migration).toBeDefined();
    const nextState = from1To2Migration(basePersistedGlobalStateAt1);

    expect(nextState).toStrictEqual(persistedStateAt2);
  });

  it("should migrate from 2 to 3", () => {
    const basePersistedGlobalStateAt2 = {
      eid: {
        _tag: "Some",
        value: {
          credentialType: "PersonIdentificationData",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      credentials: [
        {
          _tag: "Some",
          value: {
            credentialType: "EuropeanHealthInsuranceCard",
            storedStatusAttestation: undefined,
            jwt: {
              expiration: "2024-06-12T11:33:20.000Z",
              issuedAt: "2024-06-11T18:53:20.000Z"
            }
          }
        },
        {
          _tag: "Some",
          value: {
            credentialType: "MDL",
            storedStatusAttestation: undefined,
            jwt: {
              expiration: "2024-06-12T11:33:20.000Z",
              issuedAt: "2024-06-11T18:53:20.000Z"
            }
          }
        },
        { _tag: "None" }
      ],
      _persist: {
        version: 0,
        rehydrated: false
      }
    };
    const persistedStateAt3 = {
      credentials: {
        PersonIdentificationData: {
          credentialType: "PersonIdentificationData",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        MDL: {
          credentialType: "MDL",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        EuropeanHealthInsuranceCard: {
          credentialType: "EuropeanHealthInsuranceCard",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      _persist: {
        version: 0,
        rehydrated: false
      }
    };

    const from2To3Migration = itwCredentialsStateMigrations[2];
    expect(from2To3Migration).toBeDefined();
    const nextState = from2To3Migration(basePersistedGlobalStateAt2);

    expect(nextState).toStrictEqual(persistedStateAt3);
  });

  it("should migrate from 3 to 4", () => {
    const basePersistedStateAt3 = {
      credentials: {
        PersonIdentificationData: {
          credentialType: "PersonIdentificationData",
          storedStatusAttestation: undefined,
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        MDL: {
          credentialType: "MDL",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      _persist: {
        version: 0,
        rehydrated: false
      }
    };
    const persistedStateAt4 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          credentialType: "PersonIdentificationData",
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        MDL: {
          credentialType: "MDL",
          credentialId: "MDL",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      _persist: {
        version: 0,
        rehydrated: false
      }
    };

    const from3To4Migration = itwCredentialsStateMigrations[3];
    expect(from3To4Migration).toBeDefined();
    const nextState = from3To4Migration(basePersistedStateAt3);

    expect(nextState).toStrictEqual(persistedStateAt4);
  });

  it("should migrate from 4 to 5", () => {
    const basePersistedStateAt4 = {
      credentials: {
        PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        MDL: {
          credentialId: "MDL",
          credentialType: "MDL",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      _persist: {
        version: 0,
        rehydrated: false
      }
    };
    const persistedStateAt5 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        MDL: {
          credentialId: "MDL",
          credentialType: "mDL",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      _persist: {
        version: 0,
        rehydrated: false
      }
    };

    const from4To5Migration = itwCredentialsStateMigrations[4];
    expect(from4To5Migration).toBeDefined();
    const nextState = from4To5Migration(basePersistedStateAt4);

    expect(nextState).toStrictEqual(persistedStateAt5);
  });

  it("should migrate from 5 to 6", () => {
    const basePersistedStateAt5 = {
      credentials: {
        PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          storedStatusAttestation: {
            credentialStatus: "valid",
            statusAttestation: "abc123",
            parsedStatusAttestation: {}
          },
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      _persist: {
        version: 0,
        rehydrated: false
      }
    };
    const persistedStateAt6 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      _persist: {
        version: 0,
        rehydrated: false
      }
    };

    const from4To5Migration = itwCredentialsStateMigrations[5];
    expect(from4To5Migration).toBeDefined();
    const nextState = from4To5Migration(basePersistedStateAt5);

    expect(nextState).toStrictEqual(persistedStateAt6);
  });

  it("should migrate from 6 to 7", () => {
    const basePersistedStateAt6 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          storedStatusAttestation: {
            credentialStatus: "valid",
            statusAttestation: "abc123",
            parsedStatusAttestation: {}
          },
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        MDL: {
          credentialId: "MDL",
          credentialType: "mDL",
          storedStatusAttestation: {
            credentialStatus: "invalid",
            errorCode: "bad"
          },
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        dc_sd_jwt_residency: {
          credentialId: "dc_sd_jwt_residency",
          credentialType: "residency",
          storedStatusAssertion: undefined,
          jwt: {
            expiration: "2026-10-02T07:17:23.000Z",
            issuedAt: "2025-10-02T07:17:23.000Z"
          }
        }
      },
      _persist: {
        version: 0,
        rehydrated: false
      }
    };
    const persistedStateAt7 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          storedStatusAssertion: {
            credentialStatus: "valid",
            statusAssertion: "abc123",
            parsedStatusAssertion: {}
          },
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        MDL: {
          credentialId: "MDL",
          credentialType: "mDL",
          storedStatusAssertion: {
            credentialStatus: "invalid",
            errorCode: "bad"
          },
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        dc_sd_jwt_residency: {
          credentialId: "dc_sd_jwt_residency",
          credentialType: "residency",
          storedStatusAssertion: undefined,
          jwt: {
            expiration: "2026-10-02T07:17:23.000Z",
            issuedAt: "2025-10-02T07:17:23.000Z"
          }
        }
      },
      _persist: {
        version: 0,
        rehydrated: false
      }
    };

    const from6To7Migration = itwCredentialsStateMigrations[6];
    expect(from6To7Migration).toBeDefined();
    const nextState = from6To7Migration(basePersistedStateAt6);

    expect(nextState).toStrictEqual(persistedStateAt7);
  });

  it("should migrate from 7 to 8 (add spec_version and verification)", () => {
    const mockSdJwtVerification = {
      assurance_level: "high",
      trust_framework: "eidas"
    };
    const mockMdocVerification = {
      assurance_level: "substantial",
      trust_framework: "it_l2+document_proof"
    };

    jest
      .spyOn(SdJwt, "getVerification")
      .mockReturnValue(mockSdJwtVerification as any);
    jest
      .spyOn(Mdoc, "getVerificationFromParsedCredential")
      .mockReturnValue(mockMdocVerification as any);

    const basePersistedStateAt7 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          format: "dc+sd-jwt",
          credential: "sd-jwt-credential-string",
          parsedCredential: {},
          storedStatusAssertion: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        },
        mso_mdoc_mDL: {
          credentialId: "mso_mdoc_mDL",
          credentialType: "mDL",
          format: "mso_mdoc",
          credential: "mdoc-credential-string",
          parsedCredential: { deviceKeyInfo: {} },
          storedStatusAssertion: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      _persist: {
        version: 7,
        rehydrated: false
      }
    };

    const persistedStateAt8 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          format: "dc+sd-jwt",
          credential: "sd-jwt-credential-string",
          parsedCredential: {},
          storedStatusAssertion: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          },
          spec_version: WALLET_SPEC_VERSION,
          verification: mockSdJwtVerification
        },
        mso_mdoc_mDL: {
          credentialId: "mso_mdoc_mDL",
          credentialType: "mDL",
          format: "mso_mdoc",
          credential: "mdoc-credential-string",
          parsedCredential: { deviceKeyInfo: {} },
          storedStatusAssertion: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          },
          spec_version: WALLET_SPEC_VERSION,
          verification: mockMdocVerification
        }
      },
      _persist: {
        version: 7,
        rehydrated: false
      }
    };

    const from7To8Migration = itwCredentialsStateMigrations[7];
    expect(from7To8Migration).toBeDefined();
    const nextState = from7To8Migration(basePersistedStateAt7);

    expect(nextState).toStrictEqual(persistedStateAt8);
  });

  it("should handle verification extraction failure gracefully in migration 7 to 8", () => {
    jest.spyOn(SdJwt, "getVerification").mockImplementation(() => {
      throw new Error("Failed to extract verification");
    });

    const basePersistedStateAt7 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          format: "dc+sd-jwt",
          credential: "invalid-credential",
          parsedCredential: {},
          storedStatusAssertion: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      _persist: {
        version: 7,
        rehydrated: false
      }
    };

    const persistedStateAt8 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          credentialType: "PersonIdentificationData",
          format: "dc+sd-jwt",
          credential: "invalid-credential",
          parsedCredential: {},
          storedStatusAssertion: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          },
          spec_version: WALLET_SPEC_VERSION,
          verification: undefined
        }
      },
      _persist: {
        version: 7,
        rehydrated: false
      }
    };

    const from7To8Migration = itwCredentialsStateMigrations[7];
    expect(from7To8Migration).toBeDefined();
    const nextState = from7To8Migration(basePersistedStateAt7);

    expect(nextState).toStrictEqual(persistedStateAt8);
  });
});
