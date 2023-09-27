import * as React from "react";
import { IOTheme, IOThemeLight } from "@pagopa/io-app-design-system";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, TypographyProps } from "./common";

type AllowedColors =
  | IOTheme["textBody-default"]
  | "grey-650"
  | "grey-850"
  | "white"
  | "black";
type AllowedWeight = Extract<IOFontWeight, "Regular">;

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
