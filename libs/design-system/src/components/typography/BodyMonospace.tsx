import { useIOColors } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const { bodyMonospace: bodyMonospaceStyle } = IOTypography;

/** `BodyMonospace` typographic style */
export const BodyMonospace = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const BodyProps: IOTextProps = {
    ...props,
    ...bodyMonospaceStyle,
    color: customColor ?? typographyColors.bodyMonospace
  };

  return <IOText {...BodyProps}>{props.children}</IOText>;
};
