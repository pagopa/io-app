import { IoWallet } from "@pagopa/io-react-native-wallet";
import MockDate from "mockdate";

import { DigitalCredentialMetadata } from "../itwCredentialsCatalogueUtils";
import {
  getCredentialStatus,
  getCredentialStatusMessageFromCatalog,
  getCredentialStatusMessageFromIssuerConf
} from "../itwCredentialStatusUtils";
import {
  ItwCredentialFromCatalogueMocks,
  ItwStoredCredentialsMocks
} from "../itwMocksUtils";
import { CredentialMetadata, IssuerConfiguration } from "../itwTypesUtils";

const options: Parameters<typeof getCredentialStatus>[1] = {
  expiringDays: 14
};

describe("getCredentialStatus", () => {
  afterEach(() => {
    MockDate.reset();
  });

  describe("expired", () => {
    it("should return the physical document expired status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2025-01-20T00:00:00Z" // Still valid
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2024-01-12" // Expired
          }
        },
        validity: { type: "status_assertion", status: "invalid" }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual("expired");
    });

    it("should return the digital document expired status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2024-01-10T00:00:00Z" // Expired
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2034-12-31" // Still valid
          }
        },
        validity: {
          type: "status_assertion",
          status: "valid",
          statusAssertion: {} as any
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual(
        "jwtExpired"
      );
    });

    // Physical document wins
    it("should return the physical document expired status when both are expired", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2024-01-10T00:00:00Z" // Expired
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2024-01-12" // Expired
          }
        },
        validity: { type: "status_assertion", status: "invalid" }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual("expired");
    });

    it("should return jwtExpired when only JWT data are available", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.eid,
        jwt: {
          expiration: "2024-01-10T00:00:00Z"
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual(
        "jwtExpired"
      );
    });
  });

  describe("expiring", () => {
    it("should return the physical document expiring status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2025-01-20T00:00:00Z" // Still valid
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2024-01-30" // Expiring
          }
        },
        validity: {
          type: "status_assertion",
          status: "valid",
          statusAssertion: {} as any
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual("expiring");
    });

    it("should return the digital document expiring status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2024-01-30T00:00:00Z" // Expiring
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2034-12-31" // Still valid
          }
        },
        validity: {
          type: "status_assertion",
          status: "valid",
          statusAssertion: {} as any
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual(
        "jwtExpiring"
      );
    });

    // Digital document wins
    it("should return the digital document expiring status when both are expiring", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2024-01-30T00:00:00Z" // Expiring
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2024-01-25" // Expiring
          }
        },
        validity: {
          type: "status_assertion",
          status: "valid",
          statusAssertion: {} as any
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual(
        "jwtExpiring"
      );
    });

    // Physical document wins
    it("should return the physical document expiring status when both expires the same day", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2024-01-30T01:00:00Z" // Expiring
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2024-01-30" // Expiring
          }
        },
        validity: {
          type: "status_assertion",
          status: "valid",
          statusAssertion: {} as any
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual("expiring");
    });

    it("should return jwtExpiring when only JWT data are available", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.eid,
        jwt: {
          expiration: "2024-01-30T00:00:00Z"
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual(
        "jwtExpiring"
      );
    });
  });

  describe("invalid", () => {
    it("should return the physical document invalid status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2025-01-20T00:00:00Z" // Still valid
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2034-12-31"
          }
        },
        validity: { type: "status_assertion", status: "invalid" }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual("invalid");
    });

    it("should return the physical document invalid status over any digital document status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2024-01-30T01:00:00Z" // Expiring
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2034-12-31"
          }
        },
        validity: { type: "status_assertion", status: "invalid" }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual("invalid");
    });
  });

  describe("valid", () => {
    it("should return valid in normal conditions", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2025-01-20T00:00:00Z"
        },
        parsedCredential: {
          expiry_date: {
            name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
            value: "2034-12-31"
          }
        },
        validity: {
          type: "status_assertion",
          status: "valid",
          statusAssertion: {} as any
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual("valid");
    });

    it("should return valid when the credential does not have an expiration date and it is not invalid for other reasons", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: {
          expiration: "2025-01-20T00:00:00Z"
        },
        parsedCredential: {
          expiry_date: {
            name: undefined,
            value: undefined
          }
        },
        validity: {
          type: "status_assertion",
          status: "valid",
          statusAssertion: {} as any
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual("valid");
    });

    it("should return valid when only JWT data are available", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.eid,
        jwt: {
          expiration: "2025-01-20T00:00:00Z"
        }
      };

      expect(getCredentialStatus(mockCredential, options)).toEqual("valid");
    });
  });

  describe("unknown", () => {
    it("should return unknown when the status assertion could not be fetched", () => {
      const mockCredential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.eid,
        validity: {
          type: "status_assertion",
          status: "unknown"
        }
      };
      expect(getCredentialStatus(mockCredential, options)).toEqual("unknown");
    });
  });
});

describe("getCredentialStatusMessageFromCatalog", () => {
  const ioWallet = new IoWallet({ version: "1.3.3" });

  const SUSPENDED_STATUS = "0x02";
  const TITLE_L10N_ID = "credential.status.suspended.title";
  const DESCRIPTION_L10N_ID = "credential.status.suspended.description";

  const catalogMetadata: DigitalCredentialMetadata = {
    ...ItwCredentialFromCatalogueMocks,
    validity_info: {
      ...ItwCredentialFromCatalogueMocks.validity_info,
      allowed_states: [
        {
          [SUSPENDED_STATUS]: "suspended",
          title_l10n_id: TITLE_L10N_ID,
          description_l10n_id: DESCRIPTION_L10N_ID
        }
      ]
    }
  };

  const catalogTranslations = {
    [TITLE_L10N_ID]: "Credenziale sospesa",
    [DESCRIPTION_L10N_ID]: "La credenziale è stata sospesa dall'ente emittente."
  };

  it("should return the translated message for a status listed in the catalog", () => {
    expect(
      getCredentialStatusMessageFromCatalog({
        ioWallet,
        rawStatus: SUSPENDED_STATUS,
        catalogMetadata,
        catalogTranslations
      })
    ).toEqual({
      title: "Credenziale sospesa",
      description: "La credenziale è stata sospesa dall'ente emittente."
    });
  });

  // The status list returns uppercase status bits, the catalog uses lowercase keys
  it("should match the raw status regardless of its case", () => {
    expect(
      getCredentialStatusMessageFromCatalog({
        ioWallet,
        rawStatus: "0X02",
        catalogMetadata,
        catalogTranslations
      })
    ).toEqual({
      title: "Credenziale sospesa",
      description: "La credenziale è stata sospesa dall'ente emittente."
    });
  });

  it.each([
    {
      name: "rawStatus, catalogMetadata and catalogTranslations are missing",
      params: {
        rawStatus: undefined,
        catalogMetadata: undefined,
        catalogTranslations: undefined
      }
    },
    {
      name: "the raw status is not among the allowed states",
      params: {
        rawStatus: "0x0B",
        catalogMetadata,
        catalogTranslations
      }
    }
  ])("should return undefined when $name", ({ params }) => {
    expect(
      getCredentialStatusMessageFromCatalog({ ioWallet, ...params })
    ).toBeUndefined();
  });

  it.each([
    { name: "no translations are available", catalogTranslations: undefined },
    {
      name: "the l10n ids have no matching translation",
      catalogTranslations: { "another.l10n.id": "Another message" }
    }
  ])(
    "should return an empty message when $name",
    ({ catalogTranslations: translations }) => {
      expect(
        getCredentialStatusMessageFromCatalog({
          ioWallet,
          rawStatus: SUSPENDED_STATUS,
          catalogMetadata,
          catalogTranslations: translations
        })
      ).toEqual({ title: undefined, description: undefined });
    }
  );
});

describe("getCredentialStatusMessageFromIssuerConf", () => {
  const CREDENTIAL_ID = "dc_sd_jwt_mDL";
  const ERROR_CODE = "credential_suspended";

  const italianMessage = {
    title: "Patente sospesa",
    description: "La tua patente è stata sospesa."
  };
  const englishMessage = {
    title: "Suspended driving license",
    description: "Your driving license has been suspended."
  };

  const buildIssuerConf = (
    display: Array<{ description: string; locale: string; title: string }>
  ) =>
    ({
      credential_configurations_supported: {
        [CREDENTIAL_ID]: {
          issuance_errors_supported: {
            [ERROR_CODE]: { display }
          }
        }
      }
    }) as unknown as IssuerConfiguration;

  const issuerConf = buildIssuerConf([
    { locale: "it-IT", ...italianMessage },
    { locale: "en-US", ...englishMessage }
  ]);

  it("should return the message matching the current locale", async () => {
    expect(
      getCredentialStatusMessageFromIssuerConf({
        errorCode: ERROR_CODE,
        credentialId: CREDENTIAL_ID,
        issuerConf
      })
    ).toEqual(italianMessage);
  });

  it.each([
    {
      name: "errorCode, credentialId and issuerConf are missing",
      params: {
        errorCode: undefined,
        credentialId: undefined,
        issuerConf: undefined
      }
    },
    {
      name: "the error code is not supported by the issuer",
      params: {
        errorCode: "credential_revoked",
        credentialId: CREDENTIAL_ID,
        issuerConf
      }
    },
    {
      name: "the issuer has no message for the current locale",
      params: {
        errorCode: ERROR_CODE,
        credentialId: CREDENTIAL_ID,
        issuerConf: buildIssuerConf([{ locale: "en-US", ...englishMessage }])
      }
    },
    {
      name: "the credential cannot be found in the issuer configuration",
      params: {
        errorCode: ERROR_CODE,
        credentialId: "unknown_credential",
        issuerConf
      }
    }
  ])("should return undefined when $name", ({ params }) => {
    expect(getCredentialStatusMessageFromIssuerConf(params)).toBeUndefined();
  });
});
