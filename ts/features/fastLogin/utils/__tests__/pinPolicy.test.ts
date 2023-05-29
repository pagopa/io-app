import { isValidSixDigitNumber } from "../pinPolicy";

describe("isValidSixDigitNumber", () => {
  it("returns false for numbers of incorrect length", () => {
    expect(isValidSixDigitNumber(12345)).toBe(false);
    expect(isValidSixDigitNumber(1234567)).toBe(false);
    expect(isValidSixDigitNumber("12345")).toBe(false);
    expect(isValidSixDigitNumber("1234567")).toBe(false);
  });

  it("returns false for numbers with all identical digits", () => {
    expect(isValidSixDigitNumber(111111)).toBe(false);
    expect(isValidSixDigitNumber(333333)).toBe(false);
    expect(isValidSixDigitNumber("111111")).toBe(false);
    expect(isValidSixDigitNumber("333333")).toBe(false);
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

  it("returns true for other valid numbers", () => {
    expect(isValidSixDigitNumber(123451)).toBe(true);
    expect(isValidSixDigitNumber(654320)).toBe(true);
    expect(isValidSixDigitNumber("123451")).toBe(true);
    expect(isValidSixDigitNumber("654320")).toBe(true);
  });

  it("returns false for non-numeric strings", () => {
    expect(isValidSixDigitNumber("abcdef")).toBe(false);
    expect(isValidSixDigitNumber("12345a")).toBe(false);
  });
});
