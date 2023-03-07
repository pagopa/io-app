import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import type { IOColors } from "../variables/IOColors";
import { ExternalTypographyProps, RequiredTypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

// these colors are allowed only when the weight is SemiBold
type AllowedSemiBoldColors = Extract<
  IOColors,
  "bluegreyDark" | "bluegreyLight" | "white" | "red" | "blue" | "bluegrey"
>;

// when the weight is bold, only the white color is allowed
type AllowedBoldColors = Extract<IOColors, "white" | "black">;

// all the possible colors
type AllowedColors = AllowedBoldColors | AllowedSemiBoldColors;

// all the possible weight
type AllowedWeight = Extract<IOFontWeight, "Bold" | "SemiBold">;

// these are the properties allowed only if weight is undefined or SemiBold
type SemiBoldProps = {
  weight?: Extract<IOFontWeight, "SemiBold">;
  color?: AllowedSemiBoldColors;
};

// these are the properties allowed only if weight is Bold
type BoldProps = {
  weight: Extract<IOFontWeight, "Bold">;
  color?: AllowedBoldColors;
};

type BoldKindProps = SemiBoldProps | BoldProps;

type OwnProps = ExternalTypographyProps<BoldKindProps>;

const fontName: IOFontFamily = "TitilliumWeb";
export const h3FontSize = 18;

/**
 * A custom function to calculate the values if no weight or color is provided.
 * The choose of the default color depends on the weight, for this reason cannot be used
 * the default calculateWeightColor with fallback if undefined.
 * @param weight
 * @param color
 */
export const calculateH3WeightColor = (
  weight?: AllowedWeight,
  color?: AllowedColors
): RequiredTypographyProps<AllowedWeight, AllowedColors> => {
  const newWeight = weight ?? "SemiBold";
  const newColor =
    color !== undefined
      ? color
      : newWeight === "SemiBold"
      ? "bluegreyDark"
      : "white";
  return {
    weight: newWeight,
    color: newColor
  };
};

/**
 * Typography component to render `H3` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `SemiBold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const H3: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    weightColorFactory: calculateH3WeightColor,
    font: fontName,
    fontStyle: { fontSize: h3FontSize }
  });
