import { format, getMonth, getYear } from "date-fns";
import * as E from "fp-ts/lib/Either";
import MockDate from "mockdate";
import {
  getDateFromExpiryDate,
  getExpireStatus,
  isExpired,
  isExpiredDate
} from "../dates";

describe("getExpireStatus", () => {
  it("should be VALID", () => {
    const future = new Date(Date.now() + 1000 * 60 * 61 * 24 * 7); // 7 days and a minute in the future
    expect(getExpireStatus(future)).toBe("VALID");
  });

  it("should be EXPIRING", () => {
    const nearFuture = new Date(Date.now() + 1000 * 60 * 60); // 1 hour in the future
    expect(getExpireStatus(nearFuture)).toBe("EXPIRING");
  });

  it("should be EXPIRED", () => {
    const remote = new Date(Date.now() - 1000 * 60); // 1 sec ago
    expect(getExpireStatus(remote)).toBe("EXPIRED");
  });

  it("should be none since the input is not valid", () => {
    expect(isExpired("AAA", "BBB")).toEqual(E.left(Error("invalid input")));
    expect(isExpired("01", "BBB")).toEqual(E.left(Error("invalid input")));
    expect(isExpired("AAA", "2021")).toEqual(E.left(Error("invalid input")));
  });

  it("should mark the date as expired since we're passing a valid past date with 4-digit year", () => {
    MockDate.set(new Date(2020, 1, 1));
    expect(isExpired(2, 2004)).toEqual(E.right(true));
    expect(isExpired("2", "2004")).toEqual(E.right(true));
    expect(isExpired("2", 2004)).toEqual(E.right(true));
    expect(isExpired(2, "2004")).toEqual(E.right(true));
    expect(isExpired("2", "04")).toEqual(E.right(true));
  });

  it("shouldn't mark the date as expired when passing as argument the current month", () => {
    // 01/01/2020
    MockDate.set(new Date(2020, 0, 1));
    expect(isExpired(1, 2020)).toEqual(E.right(false));
    // 31/01/2020
    MockDate.set(new Date(2020, 0, 31));
    expect(isExpired(1, 2020)).toEqual(E.right(false));

    // now: 2022-02-01
    MockDate.set(new Date(2022, 1, 1));
    // card: 2023-01
    expect(isExpired("1", "23")).toEqual(E.right(false));

    // now: 2022-12-31
    MockDate.set(new Date(2022, 11, 31));
    // card: 2023-01
    expect(isExpired("1", "23")).toEqual(E.right(false));
  });

  it("should mark the date as expired when passing as argument the previous month", () => {
    // 01/01/2020
    const now = new Date(2020, 0, 1);
    MockDate.set(now);
    expect(isExpired(12, 2019)).toEqual(E.right(true));
  });

  it("should mark the card as valid, not expired", () => {
    const today = new Date();
    expect(isExpired(getMonth(today) + 1, getYear(today))).toEqual(
      E.right(false)
    );
    expect(
      isExpired(
        (getMonth(today) + 1).toString(),
        today.getFullYear().toString().substring(2, 4)
      )
    ).toEqual(E.right(false));
  });
});

describe("isExpiredDate", () => {
  it("should mark the card as valid, not expired", () => {
    const today = new Date();
    expect(isExpiredDate(today)).toEqual(false);
  });

  it("should mark the card as expired, not valid", () => {
    const today = new Date();
    expect(
      isExpiredDate(new Date(today.getFullYear(), today.getMonth() - 1))
    ).toEqual(true);
  });
});

describe("getDateFromExpiryDate", () => {
  it("should return undefined is invalid input", () => {
    const date = getDateFromExpiryDate("invalid");
    expect(date).toBeUndefined();
  });

  it("should mark the card as valid, not expired", () => {
    const today = new Date();
    const date = getDateFromExpiryDate(format(today, "YYYYMM"));
    expect(isExpiredDate(date!)).toEqual(false);
  });

  it("should mark the card as expired, not valid", () => {
    const today = new Date();
    const date = getDateFromExpiryDate(
      format(new Date(today.getFullYear(), today.getMonth() - 1), "YYYYMM")
    );
    expect(isExpiredDate(date!)).toEqual(true);
  });
});
