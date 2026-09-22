import { useIOTheme } from "../../../context";
import { IOTypography } from "../../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "../IOText";

const {
  mdH2: { colorToken, ...mdH2Style }
} = IOTypography;

/**
 * `MdH2` typographic style
 */
export const MdH2 = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const theme = useIOTheme();

  const MdH2Props: IOTextProps = {
    ...props,
    ...mdH2Style,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...MdH2Props}>{props.children}</IOText>;
};
