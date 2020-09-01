import * as React from "react";
import { Text } from "react-native";
import { RequiredAll } from "../../../types/utils";
import { IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";

/**
 * A default function used to calculate the weight and color with some fallback values if not specified.
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
  // TODO: Replace with nullish coalescing after prettier upgrade
  return {
    weight: weight !== undefined ? weight : defaultWeight,
    color: color !== undefined ? color : defaultColor
  };
}

/**
 * Define a generic type for props used by all the typography leaf components
 */
export type TypographyProps<WeightPropsType, ColorsPropsType> = {
  weight?: WeightPropsType;
  color?: ColorsPropsType;
};

// Define a standard type, using IOFontWeight and IOColorType
type DefaultTypographyProps = TypographyProps<IOFontWeight, IOColorType>;

/**
 * Define the common props interface for all the leaf Typography components.
 * In addition to the {@link DefaultTypographyProps} all the {@link Text} props are allowed (`style` excluded)
 */
export type ExternalTypographyProps<T> = T extends DefaultTypographyProps
  ? Omit<React.ComponentPropsWithRef<typeof Text>, "style"> & T
  : never;

/**
 * Define mandatory all the keys of {@link TypographyProps}
 */
export type RequiredTypographyProps<
  WeightPropsType,
  ColorsPropsType
> = RequiredAll<TypographyProps<WeightPropsType, ColorsPropsType>>;
