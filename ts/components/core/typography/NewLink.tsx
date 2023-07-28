import { Link } from "@pagopa/io-app-design-system";
import * as React from "react";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { IOFontFamily, IOFontWeight } from "../fonts";
import type { IOColors } from "../variables/IOColors";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps, TypographyProps } from "./common";

type AllowedColors = IOColors;
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Bold">;
type FontSize = "regular" | "small";
type AllowedFontSize = { fontSize?: FontSize };

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
> &
  AllowedFontSize;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSizeMapping: Record<FontSize, number> = { regular: 16, small: 14 };

export const linkLegacyDefaultColor: AllowedColors = "blue";
export const linkLegacyDefaultWeight: AllowedWeight = "SemiBold";

export const linkDefaultColor: AllowedColors = "blueIO-500";
export const linkDefaultWeight: AllowedWeight = "Bold";

/**
 * Typography component to render Link text. This component supports both design system enabled and legacy custom styles.
 * When design system is enabled, it renders the text using the Link component from `@pagopa/io-app-design-system`,
 * respecting the design system's defined colors and styles.
 * When design system is disabled, it falls back to a legacy custom style with options for custom font and font styles.
 *
 * @param {OwnProps} props - The props for the NewLink component.
 * @constructor
 */
export const NewLink: React.FunctionComponent<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const linkComponent = useTypographyFactory<AllowedWeight, AllowedColors>({
    accessibilityRole: props.onPress ? "link" : undefined,
    ...props,
    defaultWeight: linkLegacyDefaultWeight,
    defaultColor: linkLegacyDefaultColor,
    font: fontName,
    fontStyle: {
      fontSize: props.fontSize
        ? fontSizeMapping[props.fontSize]
        : fontSizeMapping.regular,
      textDecorationLine: "underline"
    }
  });

  return isDesignSystemEnabled ? <Link {...props} /> : linkComponent;
};
