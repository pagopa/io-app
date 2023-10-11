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
const labelSmallFontSize = 14;
const labelSmallLineHeight = 21;

const labelSmallFontName: IOFontFamily = "ReadexPro";
const labelSmallDefaultColor: AllowedColors = "black";
const labelSmallDefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render LabelSmall text. This component supports both design system enabled and legacy custom styles.
 * When design system is enabled, it renders the text using the LabelSmall component from `@pagopa/io-app-design-system`,
 * respecting the design system's defined colors and styles.
 * When design system is disabled, it falls back to a legacy custom style with options for custom font and font styles.
 *
 * @param {OwnProps} props - The props for the NewLabelSmall component.
 * @constructor
 */
export const NewLabelSmall: React.FC<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: labelSmallDefaultWeight,
    defaultColor: labelSmallDefaultColor,
    font: labelSmallFontName,
    fontStyle: {
      fontSize: labelSmallFontSize,
      lineHeight: labelSmallLineHeight
    }
  });
