import { useIOTheme } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const {
  h5: { colorToken, ...h5Style }
} = IOTypography;

/**
 * `H5` typographic style
 */
export const H5 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();

  const H5Props: IOTextProps = {
    ...props,
    ...h5Style,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...H5Props}>{props.children}</IOText>;
};
