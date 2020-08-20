import * as React from "react";
import { Text } from "react-native";
import { RequiredAll } from "../../../types/utils";
import { IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";

/***
 * A default function used to calculate the weight and color for a class of typography, in order to support
 * the default values if some fields are not specified.
 * @param defaultWeight the default weight value to use if weight is not defined
 * @param defaultColor the default color value to use if color is not defined
 * @param weight the optional weight value
 * @param color the optional color value
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

type DefaultTypographyProps = TypographyProps<IOFontWeight, IOColorType>;

export type ExternalTypographyProps<T> = T extends DefaultTypographyProps
  ? Omit<React.ComponentPropsWithRef<typeof Text>, "style"> & T
  : never;

export type RequiredTypographyProps<
  WeightPropsType,
  ColorsPropsType
> = RequiredAll<TypographyProps<WeightPropsType, ColorsPropsType>>;
