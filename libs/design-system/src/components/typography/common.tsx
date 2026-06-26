import { ComponentPropsWithRef } from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import type { IOColors } from "../../core";
import { IOFontFamily, IOFontWeight } from "../../utils/fonts";
import { RequiredAll } from "../../utils/types";

/**
 * Define the font size values for the typography elements
 */
export type FontSize = "regular" | "small" | "mini";

export const fontSizeMapping: Record<FontSize, number> = {
  regular: 16,
  small: 14,
  mini: 12
};
export const lineHeightMapping: Record<FontSize, number> = {
  regular: 24,
  small: 24,
  mini: 18
};

/**
 * Define the font name values for the typography elements
 */
export type FontType = {
  font?: IOFontFamily;
};

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
 * Define a generic type for props used by all the typography leaf components
 */
export type TypographyProps<WeightPropsType, ColorsPropsType> = {
  weight?: WeightPropsType;
  color?: ColorsPropsType;
};

// Define a standard type, using IOFontWeight and IOColors
type DefaultTypographyProps = TypographyProps<IOFontWeight, IOColors>;

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
 * Define the common props interface for all the leaf Typography components.
 * In addition to the {@link DefaultTypographyProps} all the {@link Text} props are allowed (`style` excluded)
 */
export type ExternalTypographyProps<T> = T extends DefaultTypographyProps
  ? Omit<ComponentPropsWithRef<typeof Text>, "style"> &
      T & { style?: TypographyStyle }
  : never;

/**
 * Define mandatory all the keys of {@link TypographyProps}
 */
export type RequiredTypographyProps<WeightPropsType, ColorsPropsType> =
  RequiredAll<TypographyProps<WeightPropsType, ColorsPropsType>>;
