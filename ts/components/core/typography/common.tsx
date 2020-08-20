import { RequiredAll } from "../../../types/utils";

/***
 * A default function used to calculate the weight and color for a class of typography, in order to support
 * the default values if some fields are not specified.
 * @param defaultWeight the default weight value to use if weight is not defined
 * @param defaultColor the default color value to use if color is not defined
 * @param weight the optional weight value
 * @param color the optzional color value
 */
export function calculateWeightColor<WeightPropsType, ColorsPropsType>(
  defaultWeight: WeightPropsType,
  defaultColor: ColorsPropsType,
  weight?: WeightPropsType,
  color?: ColorsPropsType
): RequiredTypographyProps<WeightPropsType, ColorsPropsType> {
  return {
    weight: weight !== undefined ? weight : defaultWeight,
    color: color !== undefined ? color : defaultColor
  };
}

export type TypographyProps<WeightPropsType, ColorsPropsType> = {
  weight?: WeightPropsType;
  color?: ColorsPropsType;
};

export type RequiredTypographyProps<
  WeightPropsType,
  ColorsPropsType
> = RequiredAll<TypographyProps<WeightPropsType, ColorsPropsType>>;
