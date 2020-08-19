import * as React from "react";
import { useMemo } from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { BaseTypography } from "./BaseTypography";
import { RequiredTypographyProps } from "./common";

// these colors are allowed only when the weight is SemiBold
type AllowedSemiBoldColors = Extract<
  IOColorType,
  "bluegreyDark" | "bluegreyLight" | "white"
>;

// when the weight is bold, only the white color is allowed
type AllowedBoldColors = Extract<IOColorType, "white">;

type H3AllowedColors = AllowedBoldColors | AllowedSemiBoldColors;

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

type OwnProps = AccessibilityProps & BoldKindProps;

const H3FontName: IOFontFamily = "TitilliumWeb";
const H3FontSize = 18;

/***
 * A custom function to calculate the values if no weight or color is provided.
 * The choose of the default color depends on the weight, for this reason cannot be used
 * the default calculateWeightColor.
 * @param weight
 * @param color
 */
const calculateWeightColor = (
  weight?: IOFontWeight,
  color?: H3AllowedColors
): RequiredTypographyProps<IOFontWeight, H3AllowedColors> => {
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
 * Typography component to render H3 text with font size 18.
 * default values(if not defined) weight: SemiBold, color: bluegreyDark
 * @param props
 * @constructor
 */
export const H3: React.FunctionComponent<OwnProps> = props => {
  const { weight, color } = useMemo(
    () => calculateWeightColor(props.weight, props.color),
    [props.weight, props.color]
  );

  return (
    <BaseTypography
      font={H3FontName}
      weight={weight}
      color={color}
      fontSize={H3FontSize}
      {...props}
    />
  );
};
