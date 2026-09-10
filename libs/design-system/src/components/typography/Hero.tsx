import { useIOTheme } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const {
  hero: { colorToken, ...heroStyle }
} = IOTypography;

/**
 * `Hero` typographic style
 */
export const Hero = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const theme = useIOTheme();

  const HeroProps: IOTextProps = {
    ...props,
    ...heroStyle,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...HeroProps}>{props.children}</IOText>;
};
