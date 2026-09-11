import { useIOTheme } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const {
  h1: { colorToken, ...h1Style }
} = IOTypography;

/**
 * `H1` typographic style
 */
export const H1 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();

  const H1Props: IOTextProps = {
    ...props,
    ...h1Style,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...H1Props}>{props.children}</IOText>;
};
