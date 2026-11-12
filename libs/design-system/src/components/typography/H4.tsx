import { useIOColors } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const { h4: h4Style } = IOTypography;

/** `H4` typographic style */
export const H4 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const H4Props: IOTextProps = {
    ...props,
    ...h4Style,
    color: customColor ?? typographyColors.h4
  };

  return <IOText {...H4Props}>{props.children}</IOText>;
};
