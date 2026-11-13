import { useIOColors } from "../../../context";
import { IOTypography } from "../../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "../IOText";

const { mdH3: mdH3Style } = IOTypography;

/** `MdH3` typographic style */
export const MdH3 = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const MdH3Props: IOTextProps = {
    ...props,
    ...mdH3Style,
    color: customColor ?? typographyColors.mdH3
  };

  return <IOText {...MdH3Props}>{props.children}</IOText>;
};
