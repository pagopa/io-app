import { useIOTheme } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const {
  h3: { colorToken, ...h3Style }
} = IOTypography;

/**
 * `H3` typographic style
 */
export const H3 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();

  const H3Props: IOTextProps = {
    ...props,
    ...h3Style,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...H3Props}>{props.children}</IOText>;
};
