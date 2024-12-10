import MockDate from "mockdate";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import {
  extractFiscalCode,
  getCredentialExpireDate,
  getCredentialExpireDays,
  getFiscalCodeFromCredential,
  ImageClaim,
  SimpleDateClaim
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

describe("SimpleDateClaim", () => {
  it("should handle valid, invalid, edge cases, and formatting correctly", () => {
    // Valid date decoding
    const validInput = "2024-11-19";
    const validResult = SimpleDateClaim.decode(validInput);
    expect(E.isRight(validResult)).toBe(true);
    if (E.isRight(validResult)) {
      const decodedDate = validResult.right;

      // Validate date parts
      expect(decodedDate.getFullYear()).toBe(2024);
      expect(decodedDate.getMonth()).toBe(10); // 0-indexed month
      expect(decodedDate.getDate()).toBe(19);

      // Validate default and custom formats
      expect(decodedDate.toString()).toBe("19/11/2024");
      expect(decodedDate.toString("DD/MM/YY")).toBe("19/11/24");

      // Validate Date object conversions
      expect(decodedDate.toDate()).toEqual(new Date(2024, 10, 19));
      expect(decodedDate.toDateWithoutTimezone().toISOString()).toBe(
        "2024-11-19T00:00:00.000Z"
      );
    }

    // Invalid date decoding
    const invalidInput = "invalid-date";
    const invalidResult = SimpleDateClaim.decode(invalidInput);
    expect(E.isLeft(invalidResult)).toBe(true);

    // Valid leap year date
    const leapYearInput = "2024-02-29";
    const leapYearResult = SimpleDateClaim.decode(leapYearInput);
    expect(E.isRight(leapYearResult)).toBe(true);
    if (E.isRight(leapYearResult)) {
      const leapYearDate = leapYearResult.right;
      expect(leapYearDate.getFullYear()).toBe(2024);
      expect(leapYearDate.getMonth()).toBe(1); // 0-indexed month
      expect(leapYearDate.getDate()).toBe(29);
    }

    // Valid date with padded spaces
    const paddedInput = " 2024-11-19 ";
    const paddedResult = SimpleDateClaim.decode(paddedInput.trim());
    expect(E.isRight(paddedResult)).toBe(true);
    if (E.isRight(paddedResult)) {
      const paddedDate = paddedResult.right;
      expect(paddedDate.toString()).toBe("19/11/2024");
    }
  });
});
