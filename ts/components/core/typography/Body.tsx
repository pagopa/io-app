import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { typographyFactory, TypographyProps } from "./common";

type BodyAllowedColors = Extract<IOColorType, "bluegreyDark">;
type BodyAllowedWeight = Extract<IOFontWeight, "Regular">;

type BodyProps = TypographyProps<BodyAllowedWeight, BodyAllowedColors>;

type OwnProps = BodyProps & AccessibilityProps;

const BodyFontName: IOFontFamily = "TitilliumWeb";
const BodyFontSize = 16;

export const Body: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<BodyAllowedWeight, BodyAllowedColors>({
    ...props,
    defaultWeight: "Regular",
    defaultColor: "bluegreyDark",
    font: BodyFontName,
    fontSize: BodyFontSize
  });
};
