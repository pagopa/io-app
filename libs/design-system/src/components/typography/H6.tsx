import { useIOColors, useIONewTypeface } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const {
  h6: { legacySize, ...h6Style }
} = IOTypography;

/** `H6` typographic style */
export const H6 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;
  const { newTypefaceEnabled } = useIONewTypeface();

  const H6Props: IOTextProps = {
    ...props,
    ...h6Style,
    size: newTypefaceEnabled ? h6Style.size : legacySize,
    color: customColor ?? typographyColors.h6
  };

  return <IOText {...H6Props}>{props.children}</IOText>;
};
