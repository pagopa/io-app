import * as React from "react";
import type { IOColors, IOTheme } from "@pagopa/io-app-design-system";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, RequiredTypographyProps } from "./common";

// these colors are allowed only when the weight is Semibold
type AllowedSemiboldColors = Extract<
  IOColors,
  | "bluegreyDark"
  | "bluegreyLight"
  | "white"
  | "red"
  | "blue"
  | "bluegrey"
  | "grey"
>;

// when the weight is bold, only the white color is allowed
type AllowedBoldColors = Extract<
  IOColors,
  | "white"
  | "bluegreyLight"
  | "black"
  | "bluegreyDark"
  | "blue"
  | "bluegrey"
  | "grey-200"
>;

// all the possible colors
type AllowedColors =
  | AllowedBoldColors
  | AllowedSemiboldColors
  | IOTheme["textHeading-default"];

// all the possible weight
type AllowedWeight = Extract<IOFontWeight, "Bold" | "Semibold">;

// these are the properties allowed only if weight is undefined or Semibold
type SemiboldProps = {
  weight?: Extract<IOFontWeight, "Semibold">;
  color?: AllowedSemiboldColors | IOTheme["textHeading-default"];
};

// these are the properties allowed only if weight is Bold
type BoldProps = {
  weight: Extract<IOFontWeight, "Bold">;
  color?: AllowedBoldColors | IOTheme["textHeading-default"];
};

type BoldKindProps = SemiboldProps | BoldProps;

type OwnProps = ExternalTypographyProps<BoldKindProps>;

const fontName: IOFontFamily = "TitilliumSansPro";
export const h3FontSize = 18;
export const h3LineHeight = 22;

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
  const newWeight = weight ?? "Semibold";
  const newColor =
    color !== undefined
      ? color
      : newWeight === "Semibold"
      ? "bluegreyDark"
      : "white";
  return {
    weight: newWeight,
    color: newColor
  };
};

/**
 * Typography component to render `H3` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Semibold`, color: `bluegreyDark`
 * @param props
 * @constructor
 * @deprecated Don't use local `H3`. Import it from `io-app-design-system` instead.
 */
export const H3: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    weightColorFactory: calculateH3WeightColor,
    font: fontName,
    fontStyle: { fontSize: h3FontSize, lineHeight: h3LineHeight }
  });
