import { TourItemMeasurement } from "../types";

/**
 * Expands a guided tour measurement so the cutout can cover the whole
 * tappable target even when the rendered element is visually smaller.
 */
export const getPaddedTourMeasurement = (
  measurement: TourItemMeasurement,
  padding = 0
): TourItemMeasurement => ({
  x: measurement.x - padding,
  y: measurement.y - padding,
  width: measurement.width + padding * 2,
  height: measurement.height + padding * 2
});
