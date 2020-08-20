import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { ExternalTypographyProps, RequiredTypographyProps } from "./common";
import { typographyFactory } from "./Factory";

// these colors are allowed only when the weight is SemiBold
type AllowedSemiBoldColors = Extract<
  IOColorType,
  "bluegreyDark" | "bluegreyLight" | "white"
>;

// when the weight is bold, only the white color is allowed
type AllowedBoldColors = Extract<IOColorType, "white">;

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
const fontSize = 18;

/***
 * A custom function to calculate the values if no weight or color is provided.
 * The choose of the default color depends on the weight, for this reason cannot be used
 * the default calculateWeightColor with fallback if undefined.
 * @param weight
 * @param color
 */
const calculateWeightColor = (
  weight?: AllowedWeight,
  color?: AllowedColors
): RequiredTypographyProps<AllowedWeight, AllowedColors> => {
  const newWeight = weight !== undefined ? weight : "SemiBold";
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

/***
 * Typography component to render `H3` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `SemiBold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const H3: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    weightColorFactory: calculateWeightColor,
    font: fontName,
    fontStyle: { fontSize }
  });
};
