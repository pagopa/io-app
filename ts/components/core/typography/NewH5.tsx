import { H5, IOColors, IOTheme } from "@pagopa/io-app-design-system";
import * as React from "react";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { useTypographyFactory } from "./Factory";
import { ExternalTypographyProps } from "./common";

// these colors are allowed only when the weight is SemiBold
type AllowedSemiBoldColors = Extract<
  IOColors,
  | IOTheme["textBody-default"]
  | "bluegreyDark"
  | "bluegrey"
  | "bluegreyLight"
  | "blue"
  | "white"
  | "red"
>;

// when the weight is bold, only the white color is allowed
type AllowedRegularColors = Extract<
  IOColors,
  | "bluegreyDark"
  | "bluegrey"
  | "bluegreyLight"
  | "blue"
  | "white"
  | "red"
  | "grey"
>;

// all the possible colors
type AllowedColors = AllowedSemiBoldColors | AllowedRegularColors;

// all the possible weight
type AllowedWeight = Extract<IOFontWeight, "SemiBold" | "Regular">;

// these are the properties allowed only if weight is undefined or SemiBold
type SemiBoldProps = {
  weight?: Extract<IOFontWeight, "SemiBold">;
  color?: AllowedSemiBoldColors;
};

// these are the properties allowed only if weight is Bold
type RegularProps = {
  weight: Extract<IOFontWeight, "Regular">;
  color?: AllowedRegularColors;
};

type BoldKindProps = SemiBoldProps | RegularProps;

type OwnProps = ExternalTypographyProps<BoldKindProps>;

/* Common typographic styles */
const h5FontSize = 14;
const h5DefaultColor: AllowedColors = "bluegreyDark";
/* Legacy typographic styles */
const h5LegacyFontName: IOFontFamily = "TitilliumWeb";
const h5LegacyDefaultWeight: AllowedWeight = "SemiBold";

/**
 * Typography component to render H5 text. This component supports both design system enabled and legacy custom styles.
 * When design system is enabled, it renders the text using the H5 component from `@pagopa/io-app-design-system`,
 * respecting the design system's defined colors and styles.
 * When design system is disabled, it falls back to a legacy custom style with options for custom font and font styles.
 *
 * @param {OwnProps} props - The props for the NewH5 component.
 * @constructor
 */
export const NewH5: React.FC<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const legacyH5Component = useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: h5LegacyDefaultWeight,
    defaultColor: h5DefaultColor,
    font: h5LegacyFontName,
    fontStyle: { fontSize: h5FontSize }
  });

  return isDesignSystemEnabled ? <H5 {...props} /> : legacyH5Component;
};
