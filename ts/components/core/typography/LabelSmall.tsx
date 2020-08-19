import * as React from "react";
import { AccessibilityProps } from "react-native";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { TypographyProps } from "./common";
import { typographyFactory } from "./Factory";

type AllowedColors = Extract<
  IOColorType,
  // tslint:disable-next-line:max-union-size
  "blue" | "bluegrey" | "red" | "white"
>;
type AllowedWeight = Extract<IOFontWeight, "Bold">;

type Props = TypographyProps<AllowedWeight, AllowedColors>;

type OwnProps = Props & AccessibilityProps;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 14;

export const LabelSmall: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Bold",
    defaultColor: "blue",
    font: fontName,
    fontSize
  });
};
