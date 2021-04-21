import {
  formatDateAsShortFormat,
  getExpireStatus,
  isOlderThan,
  isYoungerThan
} from "../dates";
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

describe("isYoungerThan", () => {
  // [birthDate, compareDate, age, result]
  const toTest: ReadonlyArray<[Date, Date, number, boolean]> = [
    [new Date(1970, 0, 1), new Date(2021, 5, 1), 18, false],
    [new Date(1992, 11, 1), new Date(2005, 0, 1), 13, true],
    [new Date(1900, 5, 5), new Date(1970, 0, 1), 20, false],
    [new Date(1900, 13, 55), new Date(1900, 5, 5), 10, true],
    [new Date("not a date"), new Date(1970, 0, 1), 35, false],
    [new Date(1970, 0, 1), new Date("some faulty text"), 35, false]
  ];

  toTest.forEach(tt => {
    expect(isYoungerThan(tt[2])(tt[0], tt[1])).toEqual(tt[3]);
  });
});

describe("isOlderThan", () => {
  // [birthDate, compareDate, age, result]
  const toTest: ReadonlyArray<[Date, Date, number, boolean]> = [
    [new Date(1970, 0, 1), new Date(2021, 5, 1), 18, true],
    [new Date(1992, 11, 1), new Date(2005, 0, 1), 13, false],
    [new Date(1900, 5, 5), new Date(1970, 0, 1), 20, true],
    [new Date(1900, 13, 55), new Date(1900, 5, 5), 10, false],
    [new Date("not a date"), new Date(1970, 0, 1), 35, false],
    [new Date(1970, 0, 1), new Date("some faulty text"), 35, false]
  ];

  toTest.forEach(tt => {
    expect(isOlderThan(tt[2])(tt[0], tt[1])).toEqual(tt[3]);
  });
});
