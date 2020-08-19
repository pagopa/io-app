/***
 * A common function used to calculate the weight and color for a class of typography, in order to support
 * the default values if some fields are not specified.
 * @param defaultWeight the default weight value to use if weight is not defined
 * @param defaultColor the default color value to use if color is not defined
 * @param weight the optional weight value
 * @param color the optzional color value
 */
export function calculateWeightColor<W, C>(
  defaultWeight: W,
  defaultColor: C,
  weight?: W,
  color?: C
): {
  weight: W;
  color: C;
} {
  const newWeight = weight !== undefined ? weight : defaultWeight;
  const newColor = color !== undefined ? color : defaultColor;
  return {
    weight: newWeight,
    color: newColor
  };
}
