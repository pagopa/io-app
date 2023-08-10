import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorsStatusForeground, IOTheme } from "../variables/IOColors";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, TypographyProps } from "./common";

type AllowedColors = IOColorsStatusForeground | IOTheme["textHeading-default"];
type AllowedWeight = Extract<IOFontWeight, "Bold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Common typographic styles */
const h2FontSize = 26;
const h2LineHeight = 39;

const h2FontName: IOFontFamily = "ReadexPro";
const h2DefaultColor: AllowedColors = "black";
const h2DefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render H2 text. This component supports both design system enabled and legacy custom styles.
 * When design system is enabled, it renders the text using the H2 component from `@pagopa/io-app-design-system`,
 * respecting the design system's defined colors and styles.
 * When design system is disabled, it falls back to a legacy custom style with options for custom font and font styles.
 *
 * @param {OwnProps} props - The props for the NewH2 component.
 * @constructor
 */
export const NewH2: React.FC<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: h2DefaultWeight,
    defaultColor: h2DefaultColor,
    font: h2FontName,
    fontStyle: { fontSize: h2FontSize, lineHeight: h2LineHeight }
  });
