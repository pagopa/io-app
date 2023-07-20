import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOTheme, IOThemeLight } from "../variables/IOColors";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, TypographyProps } from "./common";

type AllowedColors = IOTheme["textBody-default"] | "blueIO-850";
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Common typographic styles */
export const labelHeaderFontSize = 14;
export const labelHeaderLineHeight = 18;
export const labelHeaderDefaultColor: AllowedColors =
  IOThemeLight["textBody-default"];
/* New typographic styles */
const labelHeaderFontName: IOFontFamily = "ReadexPro";
const labelHeaderDefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `LabelHeader` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Regular`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const LabelHeader: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: labelHeaderDefaultWeight,
    defaultColor: labelHeaderDefaultColor,
    font: labelHeaderFontName,
    fontStyle: {
      fontSize: labelHeaderFontSize,
      lineHeight: labelHeaderLineHeight
    }
  });
