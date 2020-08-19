import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { typographyFactory, TypographyProps } from "./common";

type H1AllowedColors = Extract<IOColorType, "bluegreyDark" | "white">;
type H1AllowedWeight = Extract<IOFontWeight, "Bold">;

type H1Props = TypographyProps<H1AllowedWeight, H1AllowedColors>;

type OwnProps = H1Props & AccessibilityProps;

const H1FontName: IOFontFamily = "TitilliumWeb";
const H1FontSize = 28;

export const H1: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<H1AllowedWeight, H1AllowedColors>({
    ...props,
    defaultWeight: "Bold",
    defaultColor: "bluegreyDark",
    font: H1FontName,
    fontSize: H1FontSize
  });
};
