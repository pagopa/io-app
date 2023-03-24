import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import type { IOColors, IOColorsStatusForeground } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type PartialAllowedColors = Extract<
  IOColors,
  "blue" | "bluegrey" | "bluegreyDark" | "white" | "red"
>;
type AllowedColors = PartialAllowedColors | IOColorsStatusForeground;
type AllowedWeight = Extract<IOFontWeight, "Bold" | "Regular" | "SemiBold">;
type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 16;

/**
 * Typography component to render `Label` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `blue`
 * @param props`
 * @constructor
 */
export const Label: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Bold",
    defaultColor: "blue",
    font: fontName,
    fontStyle: { fontSize }
  });
