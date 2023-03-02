import * as React from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { RequiredAll } from "../../../types/utils";
import { IOFontWeight } from "../fonts";
import type { IOColors } from "../variables/IOColors";

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
  return {
    weight: weight ?? defaultWeight,
    color: color ?? defaultColor
  };
}

/**
 * Define a generic type for props used by all the typography leaf components
 */
export type TypographyProps<WeightPropsType, ColorsPropsType> = {
  weight?: WeightPropsType;
  color?: ColorsPropsType;
};

// Define a standard type, using IOFontWeight and IOColors
type DefaultTypographyProps = TypographyProps<IOFontWeight, IOColors>;

/**
 * Define the common props interface for all the leaf Typography components.
 * In addition to the {@link DefaultTypographyProps} all the {@link Text} props are allowed (`style` excluded)
 */
export type ExternalTypographyProps<T> = T extends DefaultTypographyProps
  ? Omit<React.ComponentPropsWithRef<typeof Text>, "style"> &
      T & { style?: TypographyStyle }
  : never;

/**
 * The style exported for the typography elements, without the fields characterizing the font style
 */
type TypographyStyle = StyleProp<
  Omit<
    TextStyle,
    "color" | "fontFamily" | "fontStyle" | "fontWeight" | "fontSize"
  >
>;

/**
 * Define mandatory all the keys of {@link TypographyProps}
 */
export type RequiredTypographyProps<WeightPropsType, ColorsPropsType> =
  RequiredAll<TypographyProps<WeightPropsType, ColorsPropsType>>;
