import * as React from "react";
import type { IOColors } from "@pagopa/io-app-design-system";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, RequiredTypographyProps } from "./common";

// when the weight is bold, only these color are allowed
type AllowedBoldColors = Extract<
  IOColors,
  "bluegreyDark" | "blue" | "white" | "greenLight"
>;

// these colors are allowed only when the weight is Semibold
type AllowedSemiboldColors = Extract<
  IOColors,
  "white" | "bluegreyDark" | "blue" | "bluegreyLight"
>;

// these colors are allowed only when the weight is Regular
type AllowedRegularColors = Extract<
  IOColors,
  "bluegreyDark" | "bluegrey" | "bluegreyLight" | "white" | "black"
>;

// all the possible colors
type AllowedColors =
  | AllowedBoldColors
  | AllowedSemiboldColors
  | AllowedRegularColors;

// all the possible weight
type AllowedWeight = Extract<IOFontWeight, "Bold" | "Semibold" | "Regular">;

// these are the properties allowed only if weight is Bold or undefined
type BoldProps = {
  weight?: Extract<IOFontWeight, "Bold">;
  color?: AllowedBoldColors;
};

// these are the properties allowed only if weight is undefined or Semibold
type SemiboldProps = {
  weight: Extract<IOFontWeight, "Semibold">;
  color?: AllowedSemiboldColors;
};

// these are the properties allowed only if weight is undefined or Semibold
type RegularProps = {
  weight: Extract<IOFontWeight, "Regular">;
  color?: AllowedRegularColors;
};

type BoldKindProps = SemiboldProps | BoldProps | RegularProps;

export type OwnProps = ExternalTypographyProps<BoldKindProps>;

const fontName: IOFontFamily = "TitilliumSansPro";
export const h4FontSize = 16;
export const h4LineHeight = 22;

/**
 * A custom function to calculate the values if no weight or color is provided.
 * The choose of the default color depends on the weight, for this reason cannot be used
 * the default calculateWeightColor with fallback if undefined.
 * @param weight
 * @param color
 */
export const calculateH4WeightColor = (
  weight?: AllowedWeight,
  color?: AllowedColors
): RequiredTypographyProps<AllowedWeight, AllowedColors> => {
  const newWeight = weight ?? "Bold";
  const newColor =
    color !== undefined
      ? color
      : newWeight === "Bold"
      ? "bluegreyDark"
      : newWeight === "Semibold"
      ? "white"
      : "bluegreyDark";
  return {
    weight: newWeight,
    color: newColor
  };
};

/**
 * Typography component to render `H4` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 * @deprecated Don't use local `H4`. Import it from `io-app-design-system` instead.
 */
export const H4: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    weightColorFactory: calculateH4WeightColor,
    font: fontName,
    fontStyle: { fontSize: h4FontSize, lineHeight: h4LineHeight }
  });
