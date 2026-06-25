import { getPaddedTourMeasurement } from "../measurement";

describe("getPaddedTourMeasurement", () => {
  it("expands the measurement by the given padding on each side", () => {
    expect(
      getPaddedTourMeasurement(
        {
          x: 24,
          y: 56,
          width: 24,
          height: 24
        },
        8
      )
    ).toEqual({
      x: 16,
      y: 48,
      width: 40,
      height: 40
    });
  });

  it("keeps the measurement unchanged when padding is not provided", () => {
    const measurement = {
      x: 24,
      y: 56,
      width: 24,
      height: 24
    };

    expect(getPaddedTourMeasurement(measurement)).toEqual(measurement);
  });
});
