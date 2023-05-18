import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorsStatusForeground, IOTheme } from "../variables/IOColors";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type AllowedColors = IOColorsStatusForeground | IOTheme["textHeading-default"];
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Common typographic styles */
export const h2FontSize = 20;
export const h2LineHeight = 24;
/* Legacy typographic styles */
const h2LegacyFontName: IOFontFamily = "TitilliumWeb";
const h2LegacyDefaultColor: AllowedColors = "bluegreyDark";
const h2LegacyDefaultWeight: AllowedWeight = "SemiBold";
/* New typographic styles */
const h2FontName: IOFontFamily = "ReadexPro";
const h2DefaultColor: AllowedColors = "black";
const h2DefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `H2` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const NewH4: React.FunctionComponent<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: isDesignSystemEnabled
      ? h2DefaultWeight
      : h2LegacyDefaultWeight,
    defaultColor: isDesignSystemEnabled ? h2DefaultColor : h2LegacyDefaultColor,
    font: isDesignSystemEnabled ? h2FontName : h2LegacyFontName,
    fontStyle: { fontSize: h2FontSize, lineHeight: h2LineHeight }
  });
};
