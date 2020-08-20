import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { typographyFactory } from "./Factory";

type AllowedColors = Extract<IOColorType, "blue" | "bluegrey" | "white">;
type AllowedWeight = Extract<IOFontWeight, "Bold">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 16;

/***
 * Typography component to render `Label` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `blue`
 * @param props`
 * @constructor
 */
export const Label: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Bold",
    defaultColor: "blue",
    font: fontName,
    fontStyle: { fontSize }
  });
};
