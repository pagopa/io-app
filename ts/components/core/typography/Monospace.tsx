import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { typographyFactory, TypographyProps } from "./common";

type AllowedColors = Extract<IOColorType, "bluegrey">;
type AllowedWeight = Extract<IOFontWeight, "Regular">;

type Props = TypographyProps<AllowedWeight, AllowedColors>;

type OwnProps = Props & AccessibilityProps;

const fontName: IOFontFamily = "RobotoMono";
const fontSize = 16;

export const Monospace: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Regular",
    defaultColor: "bluegrey",
    font: fontName,
    fontSize
  });
};
