import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { TypographyProps } from "./common";
import { typographyFactory } from "./Factory";

type AllowedColors = Extract<IOColorType, "blue">;
type AllowedWeight = Extract<IOFontWeight, "SemiBold">;

type Props = TypographyProps<AllowedWeight, AllowedColors>;

type OwnProps = Props & AccessibilityProps;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 16;

export const Link: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "SemiBold",
    defaultColor: "blue",
    font: fontName,
    fontSize,
    isUnderline: true
  });
};
