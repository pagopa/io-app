import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { typographyFactory, TypographyProps } from "./common";

type BodyAllowedColors = Extract<IOColorType, "blue">;
type BodyAllowedWeight = Extract<IOFontWeight, "SemiBold">;

type H1Props = TypographyProps<BodyAllowedWeight, BodyAllowedColors>;

type OwnProps = H1Props & AccessibilityProps;

const BodyFontName: IOFontFamily = "TitilliumWeb";
const BodyFontSize = 16;

export const Link: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<BodyAllowedWeight, BodyAllowedColors>({
    ...props,
    defaultWeight: "SemiBold",
    defaultColor: "blue",
    font: BodyFontName,
    fontSize: BodyFontSize,
    isUnderline: true
  });
};
