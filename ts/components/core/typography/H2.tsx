import * as React from "react";
import { useMemo } from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { BaseTypography } from "./BaseTypography";
import { calculateWeightColor, TypographyProps } from "./common";

type H2AllowedColors = Extract<IOColorType, "bluegreyDark">;
type H2AllowedWeight = Extract<IOFontWeight, "Bold">;

type H2Props = TypographyProps<H2AllowedWeight, H2AllowedColors>;

type OwnProps = H2Props & AccessibilityProps;

const H2FontName: IOFontFamily = "TitilliumWeb";
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
