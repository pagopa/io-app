import { roundToThirdDecimal } from "../number";

describe("roundToThirdDecimal", () => {
  it("should return a numberrounded to third decimal", () => {
    expect(roundToThirdDecimal(411.12345)).toEqual(411.123);
  });

  it("should return the same number", () => {
    expect(roundToThirdDecimal(411)).toEqual(411);
  });

  it("should return 0 if not a number is computed", () => {
    expect(roundToThirdDecimal(NaN)).toEqual(0);
  });
});
