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

  describe("returns false for ascending sequences", () => {
    [
      123456,
      234567,
      "123456",
      "234567",
      345678,
      456789,
      // 567890,
      "345678"
    ].forEach(
      // eslint-disable-next-line sonarjs/no-identical-functions
      input => {
        it(`${input}`, () => {
          expect(String(input).length).toBe(6);
          expect(isValidSixDigitNumber(input)).toBe(false);
        });
      }
    );
  });

  describe("returns false for descending sequences", () => {
    // eslint-disable-next-line sonarjs/no-identical-functions
    [
      654321,
      543210,
      "654321",
      "543210",
      // "098765",
      987654,
      876543,
      765432,
      654321
      // eslint-disable-next-line sonarjs/no-identical-functions
    ].forEach(input => {
      it(`${input}`, () => {
        expect(String(input).length).toBe(6);
        expect(isValidSixDigitNumber(input)).toBe(false);
      });
    });
  });

  describe("returns false for non-numeric strings", () => {
    // eslint-disable-next-line sonarjs/no-identical-functions
    ["abcdef", "12345a"].forEach(input => {
      it(`${input}`, () => {
        expect(isValidSixDigitNumber(input)).toBe(false);
      });
    });
  });

  describe("returns true for other valid numbers", () => {
    [
      123451,
      654320,
      "123451",
      "654320",
      "223344",
      "267843",
      "986654",
      "518045",
      782098,
      119876,
      223345,
      267844,
      986655,
      518046,
      782099,
      119877,
      223346,
      267845
    ].forEach(input => {
      it(`${input}`, () => {
        expect(isValidSixDigitNumber(input)).toBe(true);
      });
    });
  });
});
