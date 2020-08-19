import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { TypographyProps } from "./common";
import { typographyFactory } from "./Factory";

type AllowedColors = Extract<IOColorType, "bluegreyDark" | "white">;
type AllowedWeight = Extract<IOFontWeight, "Bold">;

type Props = TypographyProps<AllowedWeight, AllowedColors>;

type OwnProps = Props & AccessibilityProps;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 28;

export const H1: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Bold",
    defaultColor: "bluegreyDark",
    font: fontName,
    fontSize
  });
};
