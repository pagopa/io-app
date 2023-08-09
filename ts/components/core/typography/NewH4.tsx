import { H4 } from "@pagopa/io-app-design-system";
import React from "react";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOColorsStatusForeground, IOTheme } from "../variables/IOColors";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, TypographyProps } from "./common";

type AllowedColors = IOColorsStatusForeground | IOTheme["textHeading-default"];
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Common typographic styles */
const h2FontSize = 20;
const h2LineHeight = 24;
/* Legacy typographic styles */
const h2LegacyFontName: IOFontFamily = "TitilliumWeb";
const h2LegacyDefaultColor: AllowedColors = "bluegreyDark";
const h2LegacyDefaultWeight: AllowedWeight = "SemiBold";

/**
 * Typography component to render H4 text. This component supports both design system enabled and legacy custom styles.
 * When design system is enabled, it renders the text using the H4 component from `@pagopa/io-app-design-system`,
 * respecting the design system's defined colors and styles.
 * When design system is disabled, it falls back to a legacy custom style with options for custom font and font styles.
 *
 * @param {OwnProps} props - The props for the NewH4 component.
 * @constructor
 */
export const NewH4: React.FC<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const legacyH4Component = useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: h2LegacyDefaultWeight,
    defaultColor: h2LegacyDefaultColor,
    font: h2LegacyFontName,
    fontStyle: { fontSize: h2FontSize, lineHeight: h2LineHeight }
  });

  return isDesignSystemEnabled ? <H4 {...props} /> : legacyH4Component;
};
