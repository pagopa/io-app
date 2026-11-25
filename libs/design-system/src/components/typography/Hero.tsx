import { useIOColors } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const { hero: heroStyle } = IOTypography;

/** `Hero` typographic style */
export const Hero = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const HeroProps: IOTextProps = {
    ...props,
    ...heroStyle,
    color: customColor ?? typographyColors.hero
  };

  return <IOText {...HeroProps}>{props.children}</IOText>;
};
