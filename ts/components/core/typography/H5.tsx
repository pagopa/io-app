import * as React from "react";
import type { IOColors } from "@pagopa/io-app-design-system";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { ExternalTypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

// these colors are allowed only when the weight is Semibold
type AllowedSemiboldColors = Extract<
  IOColors,
  "bluegreyDark" | "bluegrey" | "bluegreyLight" | "blue" | "white" | "red"
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
type AllowedColors = AllowedSemiboldColors | AllowedRegularColors;

// all the possible weight
type AllowedWeight = Extract<IOFontWeight, "Semibold" | "Regular">;

// these are the properties allowed only if weight is undefined or Semibold
type SemiboldProps = {
  weight?: Extract<IOFontWeight, "Semibold">;
  color?: AllowedSemiboldColors;
};

// these are the properties allowed only if weight is Bold
type RegularProps = {
  weight: Extract<IOFontWeight, "Regular">;
  color?: AllowedRegularColors;
};

type BoldKindProps = SemiboldProps | RegularProps;

type OwnProps = ExternalTypographyProps<BoldKindProps>;

const fontName: IOFontFamily = "TitilliumSansPro";
export const h5FontSize = 14;
export const h5DefaultColor: AllowedColors = "bluegreyDark";
export const h5DefaultWeight: AllowedWeight = "Semibold";

/**
 * Typography component to render `H5` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Semibold`, color: `bluegreyDark`
 * @param props
 * @constructor
 * @deprecated Don't use local `H5`. Import it from `io-app-design-system` instead.
 */
export const H5: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: h5DefaultWeight,
    defaultColor: h5DefaultColor,
    font: fontName,
    fontStyle: { fontSize: h5FontSize }
  });
