import { useIONewTypeface, useIOTheme } from "../../context";
import { IOFontSize } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

export const h6FontSize: IOFontSize = 16;
export const h6LineHeight = 24;

// TODO: Remove this when legacy look is deprecated https://pagopa.atlassian.net/browse/IOPLT-153
const legacyFontSize: IOFontSize = 17;

/**
 * `H6` typographic style
 */
export const H6 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();
  const { newTypefaceEnabled } = useIONewTypeface();

  const H6Props: IOTextProps = {
    ...props,
    dynamicTypeRamp: "headline", // iOS only
    weight: "Semibold",
    size: newTypefaceEnabled ? h6FontSize : legacyFontSize,
    lineHeight: h6LineHeight,
    color: customColor ?? theme["textHeading-default"]
  };

  return <IOText {...H6Props}>{props.children}</IOText>;
};
