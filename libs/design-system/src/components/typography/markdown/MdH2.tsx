import { useIOColors } from "../../../context";
import { IOTypography } from "../../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "../IOText";

const { mdH2: mdH2Style } = IOTypography;

/** `MdH2` typographic style */
export const MdH2 = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const MdH2Props: IOTextProps = {
    ...props,
    ...mdH2Style,
    color: customColor ?? typographyColors.mdH2
  };

  return <IOText {...MdH2Props}>{props.children}</IOText>;
};
