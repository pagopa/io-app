import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { typographyFactory, TypographyProps } from "./common";

type H2AllowedColors = Extract<IOColorType, "bluegreyDark">;
type H2AllowedWeight = Extract<IOFontWeight, "Bold">;

type H2Props = TypographyProps<H2AllowedWeight, H2AllowedColors>;

type OwnProps = H2Props & AccessibilityProps;

const H2FontName: IOFontFamily = "TitilliumWeb";
const H2FontSize = 20;

export const H2: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<H2AllowedWeight, H2AllowedColors>({
    ...props,
    defaultWeight: "Bold",
    defaultColor: "bluegreyDark",
    font: H2FontName,
    fontSize: H2FontSize
  });
};
