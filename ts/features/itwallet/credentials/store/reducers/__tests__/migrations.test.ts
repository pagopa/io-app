import _ from "lodash";
import { Mdoc, SdJwt } from "@pagopa/io-react-native-wallet";
import issuerECv0_7 from "../../../../__mocks__/issuerECv0_7.json";
import issuerECv1_0 from "../../../../__mocks__/issuerECv1_0.json";
import { itwCredentialsStateMigrations } from "../migrations";

jest.mock("@pagopa/io-react-native-wallet");

describe("ITW credentials reducer migrations", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should migrate from -1 to 0", () => {
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

  it("should migrate from 0 to 1", () => {
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

  it("should migrate from 1 to 2", () => {
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

  it("should migrate from 2 to 3", () => {
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

  it("should migrate from 3 to 4", () => {
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

  it("should migrate from 4 to 5", () => {
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

  it("should migrate from 5 to 6", () => {
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

  it("should migrate from 6 to 7 (add spec_version and verification)", () => {
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
          spec_version: "1.0.0",
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
          spec_version: "1.0.0",
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

  it("should handle verification extraction failure gracefully in migration 6 to 7", () => {
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
          spec_version: "1.0.0",
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

  it("should handle correct mapping of the legacy issuerConf in migration 7 to 8", () => {
    const basePersistedStateAt8 = {
      credentials: {
        MDL: {
          credentialId: "MDL",
          credentialType: "mDL",
          issuerConf: issuerECv0_7.metadata
        }
      },
      _persist: {
        version: 8,
        rehydrated: false
      }
    };

    const persistedStateAt8 = {
      credentials: {
        MDL: {
          credentialId: "MDL",
          credentialType: "mDL",
          issuerConf: {
            authorization_endpoint: "https://pre.eaa.wallet.ipzs.it/authorize",
            credential_endpoint: "https://pre.eaa.wallet.ipzs.it/credential",
            credential_issuer: "https://pre.eaa.wallet.ipzs.it",
            pushed_authorization_request_endpoint:
              "https://pre.eaa.wallet.ipzs.it/as/par",
            token_endpoint: "https://pre.eaa.wallet.ipzs.it/token",
            status_assertion_endpoint: "https://pre.eaa.wallet.ipzs.it/status",
            nonce_endpoint: "",
            response_modes_supported: ["form_post.jwt", "query"],
            keys: issuerECv0_7.metadata.openid_credential_issuer.jwks.keys,
            federation_entity: issuerECv0_7.metadata.federation_entity,
            credential_configurations_supported: {
              MDL: {
                ...issuerECv0_7.metadata.openid_credential_issuer
                  .credential_configurations_supported.MDL,
                claims: [
                  {
                    path: ["given_name"],
                    display: [
                      { name: "Nome", locale: "it-IT" },
                      { name: "First Name", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["family_name"],
                    display: [
                      { name: "Cognome", locale: "it-IT" },
                      { name: "Family Name", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["birth_date"],
                    display: [
                      { name: "Data di nascita", locale: "it-IT" },
                      { name: "Date of birth", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["place_of_birth"],
                    display: [
                      { name: "Luogo di nascita", locale: "it-IT" },
                      { name: "Place of birth", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["portrait"],
                    display: [
                      { name: "Fotografia", locale: "it-IT" },
                      { name: "Portrait", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["issue_date"],
                    display: [
                      { name: "Data di rilascio", locale: "it-IT" },
                      { name: "Issue date", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["issuing_country"],
                    display: [
                      { name: "Paese di rilascio", locale: "it-IT" },
                      { name: "Issuing country", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["driving_privileges"],
                    display: [
                      { name: "Categoria", locale: "it-IT" },
                      { name: "Driving privileges", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["expiry_date"],
                    display: [
                      { name: "Scadenza", locale: "it-IT" },
                      { name: "Expiry date", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["document_number"],
                    display: [
                      { name: "Numero", locale: "it-IT" },
                      { name: "Document number", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["restrictions_conditions"],
                    display: [
                      { name: "Codici", locale: "it-IT" },
                      { name: "Restriction condition", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["driving_privileges_details"],
                    display: [
                      { name: "Dettagli patente", locale: "it-IT" },
                      { name: "Driving privilege details", locale: "en-US" }
                    ]
                  },
                  {
                    path: ["issuing_authority"],
                    display: [
                      { name: "Rilasciato da", locale: "it-IT" },
                      { name: "Issuing authority", locale: "en-US" }
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      _persist: {
        version: 8,
        rehydrated: false
      }
    };

    const from8To9Migration = itwCredentialsStateMigrations[8];
    expect(from8To9Migration).toBeDefined();
    const nextState = from8To9Migration(basePersistedStateAt8);

    expect(nextState).toStrictEqual(persistedStateAt8);
  });

  it("should handle correct mapping of issuerConf in migration 7 to 8", () => {
    const basePersistedStateAt8 = {
      credentials: {
        dc_sd_jwt_mDL: {
          credentialId: "dc_sd_jwt_mDL",
          credentialType: "mDL",
          issuerConf: issuerECv1_0.metadata
        }
      },
      _persist: {
        version: 8,
        rehydrated: false
      }
    };

    const persistedStateAt8 = {
      credentials: {
        dc_sd_jwt_mDL: {
          credentialId: "dc_sd_jwt_mDL",
          credentialType: "mDL",
          issuerConf: {
            authorization_endpoint:
              "https://pre.eaa.wallet.ipzs.it/1-0/authorize",
            credential_endpoint:
              "https://pre.eaa.wallet.ipzs.it/1-0/credential",
            credential_issuer: "https://pre.eaa.wallet.ipzs.it/1-0",
            pushed_authorization_request_endpoint:
              "https://pre.eaa.wallet.ipzs.it/1-0/as/par",
            token_endpoint: "https://pre.eaa.wallet.ipzs.it/1-0/token",
            status_assertion_endpoint:
              "https://pre.eaa.wallet.ipzs.it/1-0/status",
            nonce_endpoint: "https://pre.eaa.wallet.ipzs.it/1-0/nonce",
            response_modes_supported: ["query", "form_post.jwt"],
            keys: issuerECv1_0.metadata.openid_credential_issuer.jwks.keys,
            federation_entity: issuerECv1_0.metadata.federation_entity,
            credential_configurations_supported:
              issuerECv1_0.metadata.openid_credential_issuer
                .credential_configurations_supported
          }
        }
      },
      _persist: {
        version: 8,
        rehydrated: false
      }
    };

    const from8To9Migration = itwCredentialsStateMigrations[8];
    expect(from8To9Migration).toBeDefined();
    const nextState = from8To9Migration(basePersistedStateAt8);

    expect(nextState).toStrictEqual(persistedStateAt8);
  });

  it("should migrate from 8 to 9 (split credentials into legacyCredentials and JWT-free credentials)", () => {
    const inputCredentials = {
      dc_sd_jwt_PersonIdentificationData: {
        credentialId: "dc_sd_jwt_PersonIdentificationData",
        credentialType: "PersonIdentificationData",
        format: "dc+sd-jwt",
        credential: "sd-jwt-credential-string",
        parsedCredential: {},
        storedStatusAssertion: undefined,
        spec_version: "1.0.0",
        verification: undefined,
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
        parsedCredential: {},
        storedStatusAssertion: undefined,
        spec_version: "1.0.0",
        verification: undefined,
        jwt: {
          expiration: "2024-06-12T11:33:20.000Z",
          issuedAt: "2024-06-11T18:53:20.000Z"
        }
      }
    };

    const basePersistedStateAt7 = {
      credentials: inputCredentials,
      _persist: {
        version: 7,
        rehydrated: false
      }
    };

    const persistedStateAt8 = {
      credentials: {
        dc_sd_jwt_PersonIdentificationData: {
          ...inputCredentials.dc_sd_jwt_PersonIdentificationData,
          credential: undefined
        },
        mso_mdoc_mDL: {
          ...inputCredentials.mso_mdoc_mDL,
          credential: undefined
        }
      },
      legacyCredentials: basePersistedStateAt7.credentials,
      _persist: {
        version: 7,
        rehydrated: false
      }
    };

    const from7To8Migration = itwCredentialsStateMigrations[8];
    expect(from7To8Migration).toBeDefined();
    const nextState = from7To8Migration(basePersistedStateAt7);

    expect(nextState).toStrictEqual(persistedStateAt8);
  });
});
