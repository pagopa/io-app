import { addHours, addYears, format } from "date-fns";
import { convertDateToWordDistance } from "../convertDateToWordDistance";

describe("convertDateToWordDistance test plan", () => {
  it("should compare now date with 2 hours earlier, expected  hh:mm", () => {
    const nowDate = new Date();
    const testDate = addHours(nowDate, -2);
    expect(convertDateToWordDistance(testDate, "yesterday")).toBe(
      format(testDate, "H.mm")
    );
  });

  it("should compare now date with 2 hours earlier, expected 'today, at hh:mm'", () => {
    const nowDate = new Date();
    const testDate = addHours(nowDate, -2);
    expect(convertDateToWordDistance(testDate, "yesterday", "today, at")).toBe(
      `today, at ${format(testDate, "H.mm")}`
    );
  });

  it("should compare now date with 24 hours earlier, expected yesterday", () => {
    const nowDate = new Date();
    const testDate = addHours(nowDate, -24);
    expect(convertDateToWordDistance(testDate, "yesterday")).toBe("yesterday");
  });
  // eslint-disable-next-line
  it("should compare now date with 48 hours earlier, expected DD/MM", () => {
    const nowDate = new Date();
    const testDate = addHours(nowDate, -48);
    expect(convertDateToWordDistance(testDate, "yesterday")).toBe(
      format(testDate, "MM/DD")
    );
  });

  it("should return a custom 'invalid date' string if the original date is invalid", () => {
    const testDate = new Date("?");
    const customInvalidString = "Invalid date provided";
    expect(
      convertDateToWordDistance(
        testDate,
        "yesterday",
        undefined,
        customInvalidString
      )
    ).toBe(customInvalidString);
  });

  it("should compare now date with last year date, expected MM/DD/YY", () => {
    const nowDate = new Date();
    const testDate = addYears(nowDate, -1);
    expect(convertDateToWordDistance(testDate, "yesterday")).toBe(
      format(testDate, "MM/DD/YY")
    );
  });
});
