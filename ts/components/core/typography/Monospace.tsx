import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { typographyFactory, TypographyProps } from "./common";

type BodyAllowedColors = Extract<IOColorType, "bluegrey">;
type BodyAllowedWeight = Extract<IOFontWeight, "Regular">;

type H1Props = TypographyProps<BodyAllowedWeight, BodyAllowedColors>;

type OwnProps = H1Props & AccessibilityProps;

const BodyFontName: IOFontFamily = "RobotoMono";
const BodyFontSize = 16;

export const Monospace: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<BodyAllowedWeight, BodyAllowedColors>({
    ...props,
    defaultWeight: "Regular",
    defaultColor: "bluegrey",
    font: BodyFontName,
    fontSize: BodyFontSize
  });
};
