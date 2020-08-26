import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { typographyFactory } from "./Factory";

type AllowedColors = Extract<IOColorType, "blue">;
type AllowedWeight = Extract<IOFontWeight, "SemiBold">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 16;

/**
 * Typography component to render `Link` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `SemiBold`, color: `blue`
 * @param props`
 * @constructor
 */
export const Link: React.FunctionComponent<OwnProps> = props => {
  return typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "SemiBold",
    defaultColor: "blue",
    font: fontName,
    fontStyle: {
      fontSize,
      textDecorationLine: "underline"
    }
  });
};
