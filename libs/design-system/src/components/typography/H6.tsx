import { useIONewTypeface, useIOTheme } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const {
  h6: { colorToken, legacySize, ...h6Style }
} = IOTypography;

/**
 * `H6` typographic style
 */
export const H6 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();
  const { newTypefaceEnabled } = useIONewTypeface();

  const H6Props: IOTextProps = {
    ...props,
    ...h6Style,
    size: newTypefaceEnabled ? h6Style.size : legacySize,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...H6Props}>{props.children}</IOText>;
};
