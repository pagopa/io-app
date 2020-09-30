import customVariables from "../../theme/variables";

/**
 * Calculate the slop in order to have the minimum touchable area necessary for accessibility requirements
 * @param height
 */
export const calculateSlop = (height: number): number => {
  const additionalArea = customVariables.minTouchableHeight - height;
  if (additionalArea <= 0) {
    return 0;
  }
  return Math.ceil(additionalArea / 2);
};
