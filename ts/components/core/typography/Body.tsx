import * as React from "react";
import { IOColors, IOTheme } from "@pagopa/io-app-design-system";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type PartialAllowedColors = Extract<
  IOColors,
  "bluegreyDark" | "white" | "blue" | "bluegrey" | "bluegreyLight"
>;
type AllowedColors = PartialAllowedColors | IOTheme["textBody-default"];
type AllowedWeight = Extract<IOFontWeight, "Regular" | "Semibold">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "TitilliumSansPro";
export const bodyFontSize = 16;
export const bodyLineHeight = 24;
export const bodyDefaultColor: AllowedColors = "bluegrey";
export const bodyDefaultWeight: AllowedWeight = "Regular";

/**
 * Typography component to render `Body` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Regular`, color: `bluegrey`
 * @param props`
 * @constructor
 * @deprecated Don't use local `Body`. Import it from `io-app-design-system` instead.
 */
export const Body: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: bodyDefaultWeight,
    defaultColor: bodyDefaultColor,
    font: fontName,
    fontStyle: { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
  });
