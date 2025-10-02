import _ from "lodash";
import { SdJwt } from "@pagopa/io-react-native-wallet";
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

    const from4To5Migration = itwCredentialsStateMigrations[6];
    expect(from4To5Migration).toBeDefined();
    const nextState = from4To5Migration(basePersistedStateAt6);

    expect(nextState).toStrictEqual(persistedStateAt7);
  });
});
