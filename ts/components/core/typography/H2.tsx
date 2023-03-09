import * as React from "react";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { IOFontFamily, IOFontWeight } from "../fonts";
import type { IOColors, IOColorsStatusForeground } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type PartialAllowedColors = Extract<
  IOColors,
  "bluegreyDark" | "white" | "blue" | "bluegrey" | "black"
>;
type AllowedColors = PartialAllowedColors | IOColorsStatusForeground;
type AllowedWeight = Extract<IOFontWeight, "Bold" | "SemiBold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Legacy typograhic style */
const legacyFontName: IOFontFamily = "TitilliumWeb";
export const h2LegacyFontSize = 20;
export const h2LegacyLineHeight = 24;
export const h2LegacyDefaultColor: AllowedColors = "bluegreyDark";
export const h2LegacyDefaultWeight: AllowedWeight = "Bold";
/* New typograhic style */
const fontName: IOFontFamily = "ReadexPro";
export const h2FontSize = 26;
export const h2LineHeight = 30;
export const h2DefaultColor: AllowedColors = "black";
export const h2DefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `H2` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const H2: React.FunctionComponent<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return useTypographyFactory<AllowedWeight, AllowedColors>(
    isDesignSystemEnabled
      ? {
          ...props,
          defaultWeight: h2DefaultWeight,
          defaultColor: h2DefaultColor,
          font: fontName,
          fontStyle: {
            fontSize: h2FontSize,
            lineHeight: h2LineHeight
          }
        }
      : {
          ...props,
          defaultWeight: h2LegacyDefaultWeight,
          defaultColor: h2LegacyDefaultColor,
          font: legacyFontName,
          fontStyle: {
            fontSize: h2LegacyFontSize,
            lineHeight: h2LegacyLineHeight
          }
        }
  );
};
