import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorType } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type AllowedColors = Extract<IOColorType, "bluegreyDark" | "white" | "blue">;
type AllowedWeight = Extract<IOFontWeight, "Bold">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "ReadexPro";
export const h1FontSize = 28;
export const h1LineHeight = 32;
export const h1DefaultColor: AllowedColors = "bluegreyDark";
export const h1DefaultWeight: AllowedWeight = "Bold";

/**
 * Typography component to render H1 text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const H1: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: h1DefaultWeight,
    defaultColor: h1DefaultColor,
    font: fontName,
    fontStyle: { fontSize: h1FontSize, lineHeight: h1LineHeight }
  });
