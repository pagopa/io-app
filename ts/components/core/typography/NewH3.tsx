import {
  H3,
  IOColorsStatusForeground,
  IOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, TypographyProps } from "./common";

type AllowedColors = IOColorsStatusForeground | IOTheme["textHeading-default"];
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Regular">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

/* Common typographic styles */
const h3FontSize = 22;
const h3LineHeight = 33;
/* Legacy typographic styles */
const h3LegacyFontName: IOFontFamily = "TitilliumWeb";
const h3LegacyDefaultColor: AllowedColors = "bluegreyDark";
const h3LegacyDefaultWeight: AllowedWeight = "SemiBold";

/**
 * Typography component to render H3 text. This component supports both design system enabled and legacy custom styles.
 * When design system is enabled, it renders the text using the H3 component from `@pagopa/io-app-design-system`,
 * respecting the design system's defined colors and styles.
 * When design system is disabled, it falls back to a legacy custom style with options for custom font and font styles.
 *
 * @param {OwnProps} props - The props for the NewH3 component.
 * @constructor
 */
export const NewH3: React.FC<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const legacyH3Component = useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: h3LegacyDefaultWeight,
    defaultColor: h3LegacyDefaultColor,
    font: h3LegacyFontName,
    fontStyle: { fontSize: h3FontSize, lineHeight: h3LineHeight }
  });

  return isDesignSystemEnabled ? <H3 {...props} /> : legacyH3Component;
};
