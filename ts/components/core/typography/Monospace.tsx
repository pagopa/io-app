import * as React from "react";
import { IOFontFamily, IOFontWeight } from "../fonts";
import type { IOColors } from "../variables/IOColors";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type AllowedColors = Extract<IOColors, "bluegreyDark" | "bluegrey">;
type AllowedWeight = Extract<IOFontWeight, "Regular" | "SemiBold" | "Bold">;

type OwnProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
>;

const fontName: IOFontFamily = "RobotoMono";
const fontSize = 16;

/**
 * Typography component to render `Monospace` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Regular`, color: `bluegrey`
 * @param props`
 * @constructor
 */
export const Monospace: React.FunctionComponent<OwnProps> = props =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Regular",
    defaultColor: "bluegrey",
    font: fontName,
    fontStyle: { fontSize }
  });
