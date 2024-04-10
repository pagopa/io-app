import { roundToThirdDecimal, bytesToGigabytes } from "../number";

describe("roundToThirdDecimal", () => {
  it("should return a number rounded to third decimal", () => {
    expect(roundToThirdDecimal(411.12345)).toEqual(411.123);
  });

  it("should return a number rounded to third decimal", () => {
    expect(roundToThirdDecimal(1.123)).toEqual(1.123);
  });

  it("should return a number rounded to third decimal", () => {
    expect(roundToThirdDecimal(0.432)).toEqual(0.432);
  });

  it("should return the same number", () => {
    expect(roundToThirdDecimal(411)).toEqual(411);
  });

  it("should return the same number", () => {
    expect(roundToThirdDecimal(1.2)).toEqual(1.2);
  });

  it("should return 0 if not a number is computed", () => {
    expect(roundToThirdDecimal(NaN)).toEqual(0);
  });

  it("should return 0 if not a number is computed", () => {
    expect(roundToThirdDecimal(parseInt("hello", 10))).toEqual(0);
  });
});

describe("bytesToGigabytes", () => {
  it("should convert bytes to gigabytes and round to 1 decimal", () => {
    expect(bytesToGigabytes(1000000000)).toEqual(1.0);
  });

  it("should convert bytes to gigabytes and round to 1 decimal", () => {
    expect(bytesToGigabytes(5368709120)).toEqual(5.4);
  });

  it("should return 0 undefined is provided", () => {
    expect(bytesToGigabytes(NaN)).toEqual(0);
  });

  it("should return 0 if not a number is computed", () => {
    expect(bytesToGigabytes(parseInt("hello", 10))).toEqual(0);
  });
});
