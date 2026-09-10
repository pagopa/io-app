import { useIOTheme } from "../../../context";
import { IOTypography } from "../../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "../IOText";

const {
  mdH1: { colorToken, ...mdH1Style }
} = IOTypography;

/** `MdH1` typographic style */
export const MdH1 = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const theme = useIOTheme();

  const MdH1Props: IOTextProps = {
    ...props,
    ...mdH1Style,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...MdH1Props}>{props.children}</IOText>;
};
