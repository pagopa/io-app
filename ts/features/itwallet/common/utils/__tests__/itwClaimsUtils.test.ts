import MockDate from "mockdate";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import {
  extractFiscalCode,
  getCredentialExpireDate,
  getCredentialExpireDays,
  getCredentialStatus,
  getFiscalCodeFromCredential,
  ImageClaim
} from "../itwClaimsUtils";
import { StoredCredential } from "../itwTypesUtils";
import { ItwStoredCredentialsMocks } from "../itwMocksUtils";

describe("getCredentialExpireDate", () => {
  it("should return undefined", () => {
    const expireDate = getCredentialExpireDate({});
    expect(expireDate).toBeUndefined();
  });

  test.each([
    [
      {
        expiry_date: {
          name: "",
          value: "2035-10-20"
        }
      },
      new Date(2035, 9, 20)
    ],
    [
      {
        expiration_date: {
          name: "",
          value: undefined
        }
      },
      undefined
    ],
    [
      {
        expiry: {
          name: "",
          value: "01/01/2015"
        }
      },
      undefined
    ]
  ])("if %p should return %p", (value, expected) => {
    const expireDate = getCredentialExpireDate(value);
    expect(expireDate).toStrictEqual(expected);
  });
});

describe("getCredentialExpireDays", () => {
  it("should return undefined", () => {
    const expireDate = getCredentialExpireDays({});
    expect(expireDate).toBeUndefined();
  });

  test.each([
    [new Date(2000, 0, 1), "2000-01-01", 0],
    [new Date(2000, 0, 1, 23, 59), "2000-01-01", 0],
    [new Date(2000, 0, 1, 0, 0), "2000-01-07", 6],
    [new Date(2000, 0, 1, 23, 59), "2000-01-07", 6],
    [new Date(2000, 0, 1, 23, 59), "pippo", undefined],
    [new Date(2000, 0, 1, 23, 59), undefined, undefined]
  ])(
    "if current date is %p and expiration date is %p should return %p days",
    (current, expiration, difference) => {
      MockDate.set(current);
      expect(new Date()).toStrictEqual(current);

      const expireDays = getCredentialExpireDays({
        expiry_date: {
          name: "",
          value: expiration
        }
      });
      expect(expireDays).toStrictEqual(difference);

      MockDate.reset();
    }
  );
});

describe("extractFiscalCode", () => {
  it("extract a valid fiscal code", () => {
    expect(extractFiscalCode("MRARSS00A01H501B")).toEqual(
      O.some("MRARSS00A01H501B")
    );
  });

  it("extract a valid fiscal code from a string with a prefix", () => {
    expect(extractFiscalCode("TINIT-MRARSS00A01H50TB")).toEqual(
      O.some("MRARSS00A01H50TB")
    );
  });

  it("extract a valid fiscal code from a string with a suffix", () => {
    expect(extractFiscalCode("MRARSS00A01H501B_TINIT")).toEqual(
      O.some("MRARSS00A01H501B")
    );
  });

  it("extract a valid fiscal code from a string with a prefix and a suffix", () => {
    expect(extractFiscalCode("PREFIX--MRARSS00A01H501B--SUFFIX")).toEqual(
      O.some("MRARSS00A01H501B")
    );
  });

  it("returns none when the string does not contain any fiscal code", () => {
    expect(extractFiscalCode("RANDOM_STRING_MRARS001H1B")).toEqual(O.none);
  });
});

describe("ImageClaim", () => {
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAEElEQVR4nGKKrzEGBAAA//8CVAERMRFlewAAAABJRU5ErkJggg==";
  it("should decode a valid png image", () => {
    const decoded = ImageClaim.decode(`data:image/png;base64,${base64}`);
    expect(E.isRight(decoded)).toBe(true);
  });
  it("should decode a valid jpg image", () => {
    const decoded = ImageClaim.decode(`data:image/jpg;base64,${base64}`);
    expect(E.isRight(decoded)).toBe(true);
  });
  it("should decode a valid jpeg image", () => {
    const decoded = ImageClaim.decode(`data:image/jpeg;base64,${base64}`);
    expect(E.isRight(decoded)).toBe(true);
  });
  it("should decode a valid bmp image", () => {
    const decoded = ImageClaim.decode(`data:image/bmp;base64,${base64}`);
    expect(E.isRight(decoded)).toBe(true);
  });
  it("should decode an unsupported image", () => {
    const decoded = ImageClaim.decode(`data:image/gif;base64,${base64}`);
    expect(E.isLeft(decoded)).toBe(true);
  });
});

describe("getFiscalCodeFromCredential", () => {
  it("should return empty string in case of undefined credentials", () => {
    expect(getFiscalCodeFromCredential(undefined)).toEqual("");
  });

  it("should return empty string when no tax code is found in the credential", () => {
    const mockCredential: StoredCredential = {
      ...ItwStoredCredentialsMocks.eid,
      parsedCredential: {
        family_name: {
          name: { "en-US": "Family name", "it-IT": "Cognome" },
          value: "ROSSI"
        }
      }
    };
    expect(getFiscalCodeFromCredential(mockCredential)).toEqual("");
  });

  it("should return empty string when the tax code uses an unexpected format", () => {
    const mockCredential: StoredCredential = {
      ...ItwStoredCredentialsMocks.eid,
      parsedCredential: {
        tax_id_code: {
          name: { "en-US": "Tax Id number", "it-IT": "Codice Fiscale" },
          value: 1000
        }
      }
    };
    expect(getFiscalCodeFromCredential(mockCredential)).toEqual("");
  });

  it("should return the tax code when the credential is valid", () => {
    const mockCredential: StoredCredential = {
      ...ItwStoredCredentialsMocks.eid,
      parsedCredential: {
        tax_id_code: {
          name: { "en-US": "Tax Id number", "it-IT": "Codice Fiscale" },
          value: "MRARSS00A01H501B"
        }
      }
    };
    expect(getFiscalCodeFromCredential(mockCredential)).toEqual(
      "MRARSS00A01H501B"
    );
  });
});

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
});
