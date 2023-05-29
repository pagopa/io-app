import { isValidSixDigitNumber } from "../pinPolicy";

describe("isValidSixDigitNumber", () => {
  describe("returns false for numbers of incorrect length", () => {
    [13452, 1345672, "13452", "1345672"].forEach(input => {
      it(`${input}`, () => {
        expect(isValidSixDigitNumber(input)).toBe(false);
      });
    });
  });

  describe("returns false for numbers with all identical digits", () => {
    Array.from({ length: 10 }, (_, k) => k.toString().repeat(6)).forEach(
      str => {
        it(`${str}`, () => {
          expect(str.length).toBe(6);
          expect(isValidSixDigitNumber(str)).toBe(false);
        });
      }
    );
  });

  it("returns false for ascending sequences", () => {
    expect(isValidSixDigitNumber(123456)).toBe(false);
    expect(isValidSixDigitNumber(234567)).toBe(false);
    expect(isValidSixDigitNumber("123456")).toBe(false);
    expect(isValidSixDigitNumber("234567")).toBe(false);
  });

  it("returns false for descending sequences", () => {
    expect(isValidSixDigitNumber(654321)).toBe(false);
    expect(isValidSixDigitNumber(543210)).toBe(false);
    expect(isValidSixDigitNumber("654321")).toBe(false);
    expect(isValidSixDigitNumber("543210")).toBe(false);
  });

  it("returns false for non-numeric strings", () => {
    expect(isValidSixDigitNumber("abcdef")).toBe(false);
    expect(isValidSixDigitNumber("12345a")).toBe(false);
  });

  it("returns true for other valid numbers", () => {
    expect(isValidSixDigitNumber(123451)).toBe(true);
    expect(isValidSixDigitNumber(654320)).toBe(true);
    expect(isValidSixDigitNumber("123451")).toBe(true);
    expect(isValidSixDigitNumber("654320")).toBe(true);
  });
});
