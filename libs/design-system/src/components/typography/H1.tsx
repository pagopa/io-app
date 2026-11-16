import { useIOColors } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const { h1: h1Style } = IOTypography;

/** `H1` typographic style */
export const H1 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const H1Props: IOTextProps = {
    ...props,
    ...h1Style,
    color: customColor ?? typographyColors.h1
  };

  return <IOText {...H1Props}>{props.children}</IOText>;
};
