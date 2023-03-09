import * as React from "react";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColors, IOColorsStatusForeground } from "../variables/IOColors";
import { useIOSelector } from "../../../store/hooks";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type PartialAllowedColors = Extract<
  IOColors,
  "bluegreyDark" | "white" | "blue" | "black"
>;
type AllowedColors = PartialAllowedColors | IOColorsStatusForeground;
type AllowedWeight = Extract<IOFontWeight, "Bold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Legacy typograhic style */
const legacyFontName: IOFontFamily = "TitilliumWeb";
export const h1LegacyFontSize = 28;
export const h1LegacyLineHeight = 32;
export const h1LegacyDefaultColor: AllowedColors = "bluegreyDark";
export const h1LegacyDefaultWeight: AllowedWeight = "Bold";
/* New typograhic style */
const fontName: IOFontFamily = "ReadexPro";
export const h1FontSize = 28;
export const h1LineHeight = 32;
export const h1DefaultColor: AllowedColors = "black";
export const h1DefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render H1 text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const H1: React.FunctionComponent<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return useTypographyFactory<AllowedWeight, AllowedColors>(
    isDesignSystemEnabled
      ? {
          ...props,
          defaultWeight: h1DefaultWeight,
          defaultColor: h1DefaultColor,
          font: fontName,
          fontStyle: { fontSize: h1FontSize, lineHeight: h1LineHeight }
        }
      : {
          ...props,
          defaultWeight: h1LegacyDefaultWeight,
          defaultColor: h1LegacyDefaultColor,
          font: legacyFontName,
          fontStyle: {
            fontSize: h1LegacyFontSize,
            lineHeight: h1LegacyLineHeight
          }
        }
  );
};
