import { getMonth, getYear, subMonths } from "date-fns";
import { none, some } from "fp-ts/lib/Option";
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

  it("should mark the card as expired since no valid date is given", () => {
    expect(isExpired("AAA", "BBB")).toEqual(none);
  });

  it("should mark the card as expired since we're passing a valid past date with 4-digit year", () => {
    expect(isExpired(2, 2004)).toEqual(some(true));
  });

  it("should mark the card as expired since we're passing the last month", () => {
    const lastMonth = subMonths(new Date(), 1);
    expect(isExpired(getMonth(lastMonth) + 1, getYear(lastMonth))).toEqual(
      some(true)
    );
  });

  it("should mark the card as valid, thus false", () => {
    const today = new Date();
    expect(isExpired(getMonth(today) + 1, getYear(today))).toEqual(some(false));
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
