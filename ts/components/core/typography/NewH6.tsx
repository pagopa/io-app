import { H6 } from "@pagopa/io-app-design-system";
import * as React from "react";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { IOTheme, IOThemeLight } from "../variables/IOColors";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, TypographyProps } from "./common";

type AllowedColors = IOTheme["textBody-default"] | "blueIO-850";
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Common typographic styles */
const h6FontSize = 16;
const h6LineHeight = 24;
const h6DefaultColor: AllowedColors = IOThemeLight["textBody-default"];
/* Legacy typographic styles */
const h6LegacyFontName: IOFontFamily = "TitilliumWeb";
const h6LegacyDefaultWeight: AllowedWeight = "SemiBold";

/**
 * Typography component to render H6 text. This component supports both design system enabled and legacy custom styles.
 * When design system is enabled, it renders the text using the H6 component from `@pagopa/io-app-design-system`,
 * respecting the design system's defined colors and styles.
 * When design system is disabled, it falls back to a legacy custom style with options for custom font and font styles.
 *
 * @param {OwnProps} props - The props for the NewH6 component.
 * @constructor
 */
export const NewH6: React.FC<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const legacyH6Component = useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: h6LegacyDefaultWeight,
    defaultColor: h6DefaultColor,
    font: h6LegacyFontName,
    fontStyle: { fontSize: h6FontSize, lineHeight: h6LineHeight }
  });

  return isDesignSystemEnabled ? <H6 {...props} /> : legacyH6Component;
};
