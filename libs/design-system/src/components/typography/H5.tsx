import { useIOColors } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const { h5: h5Style } = IOTypography;

/** `H5` typographic style */
export const H5 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const H5Props: IOTextProps = {
    ...props,
    ...h5Style,
    color: customColor ?? typographyColors.h5
  };

  return <IOText {...H5Props}>{props.children}</IOText>;
};
