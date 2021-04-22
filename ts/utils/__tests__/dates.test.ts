import { getMonth, getYear, subMonths } from "date-fns";
import MockDate from "mockdate";
import { left, right } from "fp-ts/lib/Either";
import { formatDateAsShortFormat, getExpireStatus, isExpired } from "../dates";
import I18n from "../../i18n";

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
    expect(isExpired("AAA", "BBB")).toEqual(left(Error("invalid input")));
    expect(isExpired("01", "BBB")).toEqual(left(Error("invalid input")));
    expect(isExpired("AAA", "2021")).toEqual(left(Error("invalid input")));
  });

  it("should mark the date as expired since we're passing a valid past date with 4-digit year", () => {
    MockDate.set(new Date(2020, 1, 1));
    expect(isExpired(2, 2004)).toEqual(right(true));
    expect(isExpired("2", "2004")).toEqual(right(true));
    expect(isExpired("2", 2004)).toEqual(right(true));
    expect(isExpired(2, "2004")).toEqual(right(true));
    expect(isExpired("2", "04")).toEqual(right(true));
  });

  it("should mark the date as expired since we're passing the last month", () => {
    const now = new Date(2020, 1, 1);
    MockDate.set(now);
    const aMonthBefore = subMonths(now, 1);
    expect(
      isExpired(getMonth(aMonthBefore) + 1, getYear(aMonthBefore))
    ).toEqual(right(true));
  });

  it("should mark the card as valid, not expired", () => {
    const today = new Date();
    expect(isExpired(getMonth(today) + 1, getYear(today))).toEqual(
      right(false)
    );
    expect(
      isExpired(
        (getMonth(today) + 1).toString(),
        today.getFullYear().toString().substring(2, 4)
      )
    ).toEqual(right(false));
  });
});

describe("formatDateAsShortFormat", () => {
  const toTest: ReadonlyArray<[Date, string]> = [
    [new Date(1970, 0, 1), "01/01/1970"],
    [new Date(2020, 10, 30), "30/11/2020"],
    [new Date(1900, 5, 5), "05/06/1900"],
    [new Date(1900, 13, 55), "27/03/1901"], // handle the overflow,
    [new Date("not a date"), I18n.t("global.date.invalid")] // handle invalid date
  ];

  toTest.forEach(tt => {
    expect(formatDateAsShortFormat(tt[0])).toEqual(tt[1]);
  });
});
