import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOTheme, IOThemeLight } from "../variables/IOColors";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type AllowedColors = IOTheme["textBody-default"] | "blueIO-850";
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Common typographic styles */
export const ctaFontSize = 16;
export const ctaLineHeight = 20;
export const ctaDefaultColor: AllowedColors = IOThemeLight["textBody-default"];
/* Legacy typographic styles */
const ctaLegacyFontName: IOFontFamily = "TitilliumWeb";
const ctaLegacyDefaultWeight: AllowedWeight = "Regular";
/* New typographic styles */
const ctaFontName: IOFontFamily = "ReadexPro";
const ctaDefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `H4` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const CTA: React.FunctionComponent<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: isDesignSystemEnabled
      ? ctaDefaultWeight
      : ctaLegacyDefaultWeight,
    defaultColor: ctaDefaultColor,
    font: isDesignSystemEnabled ? ctaFontName : ctaLegacyFontName,
    fontStyle: { fontSize: ctaFontSize, lineHeight: ctaLineHeight }
  });
};
