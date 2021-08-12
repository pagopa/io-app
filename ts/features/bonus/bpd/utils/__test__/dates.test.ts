import MockDate from "mockdate";
import { isInGracePeriod } from "../dates";

describe("isInGracePeriod", () => {
  it("should return true if actual date is between endDate and gracePeriod date", () => {
    const endDate = new Date(2020, 11, 31);
    MockDate.set("2021-01-08");
    expect(isInGracePeriod(endDate, 10)).toBeTruthy();
  });

  it("should return false if actual date is before endDate", () => {
    const endDate = new Date(2020, 11, 31);
    MockDate.set("2020-12-29");
    expect(isInGracePeriod(endDate, 10)).toBeFalsy();
  });

  it("should return false if actual date is after endDate + gracePeriod", () => {
    const endDate = new Date(2020, 11, 31);
    MockDate.set("2021-01-29");
    expect(isInGracePeriod(endDate, 10)).toBeFalsy();
  });

  it("should return false if invalid endDate is passed", () => {
    const endDate = new Date(NaN);
    MockDate.set("2021-01-29");
    expect(isInGracePeriod(endDate, 10)).toBeFalsy();
  });

  it("should return false if invalid gracePeriod value is passed", () => {
    const endDate = new Date(2020, 11, 31);
    MockDate.set("2021-01-29");
    expect(isInGracePeriod(endDate, NaN)).toBeFalsy();
  });
});
