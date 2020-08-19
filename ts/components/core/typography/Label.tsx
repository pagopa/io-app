import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { typographyFactory, TypographyProps } from "./common";

type AllowedColors = Extract<IOColorType, "blue" | "bluegrey" | "white">;
type AllowedWeight = Extract<IOFontWeight, "Bold">;

type Props = TypographyProps<AllowedWeight, AllowedColors>;

type OwnProps = Props & AccessibilityProps;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 16;

export const Label: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Bold",
    defaultColor: "blue",
    font: fontName,
    fontSize
  });
};
