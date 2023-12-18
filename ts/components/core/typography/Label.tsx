import {
  FontSize,
  fontSizeMapping,
  type IOColors,
  type IOColorsStatusForeground
} from "@pagopa/io-app-design-system";
import { IOFontFamily, IOFontWeight } from "../fonts";
import { ExternalTypographyProps, TypographyProps } from "./common";
import { useTypographyFactory } from "./Factory";

type PartialAllowedColors = Extract<
  IOColors,
  "blue" | "bluegrey" | "bluegreyDark" | "white" | "red"
>;
type AllowedColors = PartialAllowedColors | IOColorsStatusForeground;
type AllowedWeight = Extract<IOFontWeight, "Bold" | "Regular" | "SemiBold">;
type LabelProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors>
> & { fontSize?: FontSize };

const fontName: IOFontFamily = "TitilliumWeb";

/**
 * Typography component to render `Label` text with font size {@link fontSize} and fontFamily {@link fontName}.
 * default values(if not defined) are weight: `Bold`, color: `blue`
 * @param props`
 * @constructor
 */
export const Label = ({ fontSize, ...rest }: LabelProps) =>
  useTypographyFactory<AllowedWeight, AllowedColors>({
    ...rest,
    defaultWeight: "Bold",
    defaultColor: "blue",
    font: fontName,
    fontStyle: {
      fontSize: fontSize ? fontSizeMapping[fontSize] : fontSizeMapping.regular
    }
  });
