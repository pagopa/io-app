import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import type { IOColors } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type AllowedColors = IOColors;
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Bold">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 16;
export const linkDefaultColor: AllowedColors = "blue";
export const linkDefaultWeight: AllowedWeight = "SemiBold";

/**
 * Typography component to render `Link` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `SemiBold`, color: `blue`
 * @param props`
 * @constructor
 */
export const Link: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    accessibilityRole: props.onPress ? "link" : undefined,
    ...props,
    defaultWeight: linkDefaultWeight,
    defaultColor: linkDefaultColor,
    font: fontName,
    fontStyle: {
      fontSize,
      textDecorationLine: "underline"
    }
  });
