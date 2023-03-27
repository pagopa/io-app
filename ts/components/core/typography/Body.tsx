import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColors, IOTheme } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type PartialAllowedColors = Extract<
  IOColors,
  "bluegreyDark" | "white" | "blue" | "bluegrey"
>;
type AllowedColors = PartialAllowedColors | IOTheme["textBody-default"];
type AllowedWeight = Extract<IOFontWeight, "Regular" | "SemiBold">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "TitilliumWeb";
export const bodyFontSize = 16;
export const bodyLineHeight = 24;
export const bodyDefaultColor: AllowedColors = "bluegreyDark";
export const bodyDefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `Body` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Regular`, color: `bluegreyDark`
 * @param props`
 * @constructor
 */
export const Body: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: bodyDefaultWeight,
    defaultColor: bodyDefaultColor,
    font: fontName,
    fontStyle: { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
  });
