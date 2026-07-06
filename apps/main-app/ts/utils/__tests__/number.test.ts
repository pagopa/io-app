import { roundToThirdDecimal } from "../number";

describe("roundToThirdDecimal", () => {
  it.each([
    [411.12345, 411.123],
    [1.123, 1.123],
    [0.432, 0.432],
  ])("should return %p rounded to third decimal (%p)", (input, expected) => {
    expect(roundToThirdDecimal(input)).toEqual(expected);
  });

  it.each([
    [411, 411],
    [1.2, 1.2],
  ])("should return the same number for %p", (input, expected) => {
    expect(roundToThirdDecimal(input)).toEqual(expected);
  });

  it.each([
    [NaN, 0],
    [parseInt("hello", 10), 0],
  ])(
    "should return 0 when %p is not a computable number",
    (input, expected) => {
      expect(roundToThirdDecimal(input)).toEqual(expected);
    },
  );
});
