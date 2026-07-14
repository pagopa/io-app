import { useIOTheme } from "../../context";
import { IOFontSize } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

export const heroFontSize: IOFontSize = 32;
export const heroLineHeight = 48;

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
    weight: "Semibold",
    size: 32,
    lineHeight: 48,
    color: customColor ?? theme["textHeading-default"]
  };

  return <IOText {...HeroProps}>{props.children}</IOText>;
};
