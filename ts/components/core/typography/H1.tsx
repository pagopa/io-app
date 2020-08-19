import * as React from "react";
import { useMemo } from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { BaseTypography } from "./BaseTypography";
import { calculateWeightColor, TypographyProps } from "./common";

type H1AllowedColors = Extract<IOColorType, "bluegreyDark" | "white">;
type H1AllowedWeight = Extract<IOFontWeight, "Bold">;

type H1Props = TypographyProps<H1AllowedWeight, H1AllowedColors>;

type OwnProps = H1Props & AccessibilityProps;

const H1FontName: IOFontFamily = "TitilliumWeb";
const H1FontSize = 28;

export const H1: React.FunctionComponent<OwnProps> = props => {
  const { weight, color } = useMemo(
    () =>
      calculateWeightColor<H1AllowedWeight, H1AllowedColors>(
        "Bold",
        "bluegreyDark",
        props.weight,
        props.color
      ),
    [props.weight, props.color]
  );

  return (
    <BaseTypography
      font={H1FontName}
      weight={weight}
      color={color}
      fontSize={H1FontSize}
      {...props}
    />
  );
};
