import * as React from "react";
import { IOTheme, IOThemeLight } from "@pagopa/io-app-design-system";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, TypographyProps } from "./common";

type AllowedColors = IOTheme["textBody-default"] | "blueIO-850";
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Common typographic styles */
export const ctaFontSize = 16;
export const ctaLineHeight = 20;
export const ctaDefaultColor: AllowedColors = IOThemeLight["textBody-default"];
/* New typographic styles */
const ctaFontName: IOFontFamily = "ReadexPro";
const ctaDefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `H4` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const CTA: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: ctaDefaultWeight,
    defaultColor: ctaDefaultColor,
    font: ctaFontName,
    fontStyle: { fontSize: ctaFontSize, lineHeight: ctaLineHeight }
  });
