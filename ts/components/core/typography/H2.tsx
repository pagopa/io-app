import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import type { IOColors, IOColorsStatusForeground } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type PartialAllowedColors = Extract<
  IOColors,
  "bluegreyDark" | "white" | "blue" | "bluegrey"
>;
type AllowedColors = PartialAllowedColors | IOColorsStatusForeground;
type AllowedWeight = Extract<IOFontWeight, "Bold" | "SemiBold">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "TitilliumWeb";
export const h2FontSize = 20;
export const h2LineHeight = 24;
export const h2DefaultColor: AllowedColors = "bluegreyDark";
export const h2DefaultWeight: AllowedWeight = "Bold";

/**
 * Typography component to render `H2` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const H2: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: h2DefaultWeight,
    defaultColor: h2DefaultColor,
    font: fontName,
    fontStyle: { fontSize: h2FontSize, lineHeight: h2LineHeight }
  });
