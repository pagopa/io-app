import { useIOColors } from "../../../context";
import { IOTypography } from "../../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "../IOText";

const { mdH1: mdH1Style } = IOTypography;

/** `MdH1` typographic style */
export const MdH1 = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const MdH1Props: IOTextProps = {
    ...props,
    ...mdH1Style,
    color: customColor ?? typographyColors.mdH1
  };

  return <IOText {...MdH1Props}>{props.children}</IOText>;
};
