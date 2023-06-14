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
export const h6FontSize = 16;
export const h6LineHeight = 24;
export const h6DefaultColor: AllowedColors = IOThemeLight["textBody-default"];
/* Legacy typographic styles */
const h6LegacyFontName: IOFontFamily = "TitilliumWeb";
const h6LegacyDefaultWeight: AllowedWeight = "SemiBold";
/* New typographic styles */
const h6FontName: IOFontFamily = "ReadexPro";
const h6DefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `H4` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const NewH6: React.FunctionComponent<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: isDesignSystemEnabled
      ? h6DefaultWeight
      : h6LegacyDefaultWeight,
    defaultColor: h6DefaultColor,
    font: isDesignSystemEnabled ? h6FontName : h6LegacyFontName,
    fontStyle: { fontSize: h6FontSize, lineHeight: h6LineHeight }
  });
};
