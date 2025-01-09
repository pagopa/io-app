import MockDate from "mockdate";
import { getCredentialStatus } from "../itwCredentialStatusUtils";
import { ItwStoredCredentialsMocks } from "../itwMocksUtils";
import { StoredCredential } from "../itwTypesUtils";

describe("getCredentialStatus", () => {
  afterEach(() => {
    MockDate.reset();
  });

  describe("expired", () => {
    it("should return the physical document expired status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        storedStatusAttestation: { credentialStatus: "invalid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("expired");
    });

    it("should return the digital document expired status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        // @ts-expect-error partial type
        storedStatusAttestation: { credentialStatus: "valid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("jwtExpired");
    });

    // Physical document wins
    it("should return the physical document expired status when both are expired", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        storedStatusAttestation: { credentialStatus: "invalid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("expired");
    });

    it("should return jwtExpired when only JWT data are available", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
        ...ItwStoredCredentialsMocks.eid,
        jwt: {
          expiration: "2024-01-10T00:00:00Z"
        }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("jwtExpired");
    });
  });

  describe("expiring", () => {
    it("should return the physical document expiring status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        // @ts-expect-error partial type
        storedStatusAttestation: { credentialStatus: "valid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("expiring");
    });

    it("should return the digital document expiring status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        // @ts-expect-error partial type
        storedStatusAttestation: { credentialStatus: "valid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("jwtExpiring");
    });

    // Digital document wins
    it("should return the digital document expiring status when both are expiring", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        // @ts-expect-error partial type
        storedStatusAttestation: { credentialStatus: "valid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("jwtExpiring");
    });

    // Physical document wins
    it("should return the physical document expiring status when both expires the same day", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        // @ts-expect-error partial type
        storedStatusAttestation: { credentialStatus: "valid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("expiring");
    });

    it("should return jwtExpiring when only JWT data are available", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
        ...ItwStoredCredentialsMocks.eid,
        jwt: {
          expiration: "2024-01-30T00:00:00Z"
        }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("jwtExpiring");
    });
  });

  describe("invalid", () => {
    it("should return the physical document invalid status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        storedStatusAttestation: { credentialStatus: "invalid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("invalid");
    });

    it("should return the physical document invalid status over any digital document status", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        storedStatusAttestation: { credentialStatus: "invalid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("invalid");
    });
  });

  describe("valid", () => {
    it("should return valid in normal conditions", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        // @ts-expect-error partial type
        storedStatusAttestation: { credentialStatus: "valid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("valid");
    });

    it("should return valid when the credential does not have an expiration date and it is not invalid for other reasons", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
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
        // @ts-expect-error partial type
        storedStatusAttestation: { credentialStatus: "valid" }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("valid");
    });

    it("should return valid when only JWT data are available", () => {
      MockDate.set(new Date(2024, 0, 20));

      const mockCredential: StoredCredential = {
        ...ItwStoredCredentialsMocks.eid,
        jwt: {
          expiration: "2025-01-20T00:00:00Z"
        }
      };

      expect(getCredentialStatus(mockCredential)).toEqual("valid");
    });
  });

  describe("unknown", () => {
    it("should return unknown when the status attestation could not be fetched", () => {
      const mockCredential: StoredCredential = {
        ...ItwStoredCredentialsMocks.eid,
        storedStatusAttestation: {
          credentialStatus: "unknown"
        }
      };
      expect(getCredentialStatus(mockCredential)).toEqual("unknown");
    });
  });
});
