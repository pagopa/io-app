import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { typographyFactory } from "./Factory";

type AllowedColors = Extract<IOColorType, "bluegreyDark">;
type AllowedWeight = Extract<IOFontWeight, "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 16;

/***
 * Typography component to render `Body` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Regular`, color: `bluegreyDark`
 * @param props`
 * @constructor
 */
export const Body: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Regular",
    defaultColor: "bluegreyDark",
    font: fontName,
    fontStyle: { fontSize }
  });
};
