import * as React from "react";
import { useMemo } from "react";
import { AccessibilityProps } from "react-native";
import { FontFamily, FontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { BaseTypography } from "./BaseTypography";
import { calculateWeightColor } from "./common";

type H2AllowedColors = Extract<IOColorType, "bluegreyDark">;
type H2AllowedWeight = Extract<FontWeight, "Bold">;

type H2Props = {
  weight?: H2AllowedWeight;
  color?: H2AllowedColors;
};

type OwnProps = H2Props & AccessibilityProps;

const H2FontName: FontFamily = "TitilliumWeb";
const H2FontSize = 20;

export const H2: React.FunctionComponent<OwnProps> = props => {
  const { weight, color } = useMemo(
    () =>
      calculateWeightColor<H2AllowedWeight, H2AllowedColors>(
        "Bold",
        "bluegreyDark",
        props.weight,
        props.color
      ),
    [props.weight, props.color]
  );

  return (
    <BaseTypography
      font={H2FontName}
      weight={weight}
      color={color}
      fontSize={H2FontSize}
      {...props}
    />
  );
};
