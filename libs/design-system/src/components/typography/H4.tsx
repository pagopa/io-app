import { useIOTheme } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const {
  h4: { colorToken, ...h4Style }
} = IOTypography;

/**
 * `H4` typographic style
 */
export const H4 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();

  const H4Props: IOTextProps = {
    ...props,
    ...h4Style,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...H4Props}>{props.children}</IOText>;
};
