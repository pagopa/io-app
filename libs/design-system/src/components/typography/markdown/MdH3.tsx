import { useIOTheme } from "../../../context";
import { IOTypography } from "../../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "../IOText";

const {
  mdH3: { colorToken, ...mdH3Style }
} = IOTypography;

/**
 * `MdH3` typographic style
 */
export const MdH3 = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const theme = useIOTheme();

  const MdH3Props: IOTextProps = {
    ...props,
    ...mdH3Style,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...MdH3Props}>{props.children}</IOText>;
};
