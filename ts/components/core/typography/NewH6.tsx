import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOTheme, IOThemeLight } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

// when the weight is bold, only these color are allowed
type AllowedColors = IOTheme["textBody-default"];
type AllowedWeight = Extract<IOFontWeight, "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "ReadexPro";
export const h6FontSize = 16;
export const h6LineHeight = 24;
export const h6DefaultColor: AllowedColors = IOThemeLight["textBody-default"];
export const h6DefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `H4` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const NewH6: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: h6DefaultWeight,
    defaultColor: h6DefaultColor,
    font: fontName,
    fontStyle: { fontSize: h6FontSize, lineHeight: h6LineHeight }
  });
