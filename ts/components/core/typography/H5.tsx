import * as React from "react";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { IOFontFamily, IOFontWeight } from "../fonts";
import type { IOColors } from "../variables/IOColors";
import { ExternalTypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

// these colors are allowed only when the weight is SemiBold
type AllowedSemiBoldColors = Extract<
  IOColors,
  | "bluegreyDark"
  | "bluegrey"
  | "bluegreyLight"
  | "blue"
  | "white"
  | "red"
  | "black"
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

/* Legacy typograhic style */
const legacyFontName: IOFontFamily = "TitilliumWeb";
export const h5LegacyFontSize = 14;
export const h5LegacyDefaultColor: AllowedColors = "bluegreyDark";
export const h5LegacyDefaultWeight: AllowedWeight = "SemiBold";
/* New typograhic style */
const fontName: IOFontFamily = "TitilliumWeb";
export const h5FontSize = 14;
export const h5LineHeight = 16;
export const h5DefaultColor: AllowedColors = "black";
export const h5DefaultWeight: AllowedWeight = "SemiBold";

/**
 * Typography component to render `H5` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `SemiBold`, color: `bluegreyDark`
 * @param props
 * @constructor
 */
export const H5: React.FunctionComponent<OwnProps> = props => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return useTypographyFactory<AllowedWeight, AllowedColors>(
    isDesignSystemEnabled
      ? {
          ...props,
          defaultWeight: h5DefaultWeight,
          defaultColor: h5DefaultColor,
          font: fontName,
          fontStyle: { fontSize: h5FontSize, textTransform: "uppercase" }
        }
      : {
          ...props,
          defaultWeight: h5LegacyDefaultWeight,
          defaultColor: h5LegacyDefaultColor,
          font: legacyFontName,
          fontStyle: { fontSize: h5LegacyFontSize }
        }
  );
};
