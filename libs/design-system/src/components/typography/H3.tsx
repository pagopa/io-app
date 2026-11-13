import { useIOColors } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const { h3: h3Style } = IOTypography;

/** `H3` typographic style */
export const H3 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const H3Props: IOTextProps = {
    ...props,
    ...h3Style,
    color: customColor ?? typographyColors.h3
  };

  return <IOText {...H3Props}>{props.children}</IOText>;
};
