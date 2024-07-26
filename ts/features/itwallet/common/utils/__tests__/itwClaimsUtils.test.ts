import MockDate from "mockdate";
import { format } from "date-fns";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import {
  extractFiscalCode,
  getCredentialExpireDate,
  getCredentialExpireDays,
  getCredentialExpireStatus,
  ImageClaim
} from "../itwClaimsUtils";

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
          value: "01/01/2015"
        }
      },
      new Date(2015, 0, 1)
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

describe("getCredentialExpireStatus", () => {
  it("should return undefined", () => {
    const expireStatus = getCredentialExpireStatus({});
    expect(expireStatus).toBeUndefined();
  });

  test.each([
    [new Date(2000, 0, 18), "expiring"],
    [new Date(2000, 0, 30), "valid"],
    [new Date(2000, 0, 9), "expired"]
  ])("if %p should return %p", (expiryDate, expectedStatus) => {
    MockDate.set(new Date(2000, 0, 10, 23, 59));
    expect(new Date()).toStrictEqual(new Date(2000, 0, 10, 23, 59));

    const status = getCredentialExpireStatus({
      expiry_date: {
        name: "",
        value: format(expiryDate, "YYYY-MM-DD")
      }
    });
    expect(status).toStrictEqual(expectedStatus);
    MockDate.reset();
  });
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
    const decoded = ImageClaim.decode("data:image/jpg;base64,${base64}");
    expect(E.isRight(decoded)).toBe(true);
  });
  it("should decode a valid jpeg image", () => {
    const decoded = ImageClaim.decode("data:image/jpeg;base64,${base64}");
    expect(E.isRight(decoded)).toBe(true);
  });
  it("should decode a valid bmp image", () => {
    const decoded = ImageClaim.decode("data:image/bmp;base64,${base64}");
    expect(E.isRight(decoded)).toBe(true);
  });
  it("should decode an unsupported image", () => {
    const decoded = ImageClaim.decode("data:image/gif;base64,${base64}");
    expect(E.isLeft(decoded)).toBe(true);
  });
});
