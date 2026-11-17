import { useIOColors } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const { buttonText: buttonTextStyle } = IOTypography;

/** `ButtonText` typographic style */
export const ButtonText = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const ButtonTextProps: IOTextProps = {
    ...props,
    ...buttonTextStyle,
    color: customColor ?? typographyColors.buttonText
  };

  return <IOText {...ButtonTextProps}>{props.children}</IOText>;
};
