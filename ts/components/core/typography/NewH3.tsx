import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorsStatusForeground, IOTheme } from "../variables/IOColors";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type AllowedColors = IOColorsStatusForeground | IOTheme["textHeading-default"];
type AllowedWeight = Extract<IOFontWeight, "Bold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Common typographic styles */
export const h3FontSize = 22;
export const h3LineHeight = 33;
/* Legacy typographic styles */
const h3LegacyFontName: IOFontFamily = "TitilliumWeb";
const h3LegacyDefaultColor: AllowedColors = "bluegreyDark";
const h3LegacyDefaultWeight: AllowedWeight = "Bold";
/* New typographic styles */
const h3FontName: IOFontFamily = "ReadexPro";
const h3DefaultColor: AllowedColors = "black";
const h3DefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `H2` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const NewH3: React.FunctionComponent<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: isDesignSystemEnabled
      ? h3DefaultWeight
      : h3LegacyDefaultWeight,
    defaultColor: isDesignSystemEnabled ? h3DefaultColor : h3LegacyDefaultColor,
    font: isDesignSystemEnabled ? h3FontName : h3LegacyFontName,
    fontStyle: { fontSize: h3FontSize, lineHeight: h3LineHeight }
  });
};
