import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { TypographyProps } from "./common";
import { typographyFactory } from "./Factory";

type AllowedColors = Extract<IOColorType, "bluegreyDark">;
type AllowedWeight = Extract<IOFontWeight, "Regular">;

type Props = TypographyProps<AllowedWeight, AllowedColors>;

type OwnProps = Props & AccessibilityProps;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 16;

export const Body: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Regular",
    defaultColor: "bluegreyDark",
    font: fontName,
    fontSize
  });
};
