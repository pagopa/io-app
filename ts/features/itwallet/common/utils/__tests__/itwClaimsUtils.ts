import { format } from "date-fns";
import {
  getCredentialExpireDate,
  getCredentialExpireDays,
  getCredentialExpireStatus
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

  it("should return the expire days remaining", () => {
    const expireDate = new Date(Date.now() + 1000 * 60 * 61 * 24 * 7);
    const expireDays = getCredentialExpireDays({
      expiry_date: {
        name: "",
        value: format(expireDate, "YYYY-MM-DD")
      }
    });
    expect(expireDays).toStrictEqual(7);
  });
});

describe("getCredentialExpireStatus", () => {
  it("should return undefined", () => {
    const expireStatus = getCredentialExpireStatus({});
    expect(expireStatus).toBeUndefined();
  });

  test.each([
    [
      {
        expiry_date: {
          name: "",
          value: format(
            new Date(Date.now() + 1000 * 60 * 61 * 24 * 7),
            "YYYY-MM-DD"
          )
        }
      },
      "EXPIRING"
    ],
    [
      {
        expiry_date: {
          name: "",
          value: format(
            new Date(Date.now() + 1000 * 60 * 61 * 24 * 20),
            "YYYY-MM-DD"
          )
        }
      },
      "VALID"
    ],
    [
      {
        expiry_date: {
          name: "",
          value: format(new Date(Date.now() - 1000), "YYYY-MM-DD")
        }
      },
      "EXPIRED"
    ],
    [
      {
        expiry: {
          name: "",
          value: format(
            new Date(Date.now() + 1000 * 60 * 61 * 24 * 7),
            "YYYY-MM-DD"
          )
        }
      },
      undefined
    ]
  ])("if %p should return %p", (value, expected) => {
    const expireDate = getCredentialExpireStatus(value);
    expect(expireDate).toStrictEqual(expected);
  });
});
