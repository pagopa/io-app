import { useIOColors } from "../../context";
import { IOTypography } from "../../core";
import { IOFontWeight } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

type H2StyleProps = TypographicStyleProps & {
  weight?: Extract<IOFontWeight, "Bold" | "Semibold">;
};

const { h2: h2Style } = IOTypography;

/** `H2` typographic style */
export const H2 = ({
  weight: customWeight,
  color: customColor,
  ...props
}: H2StyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const H2Props: IOTextProps = {
    ...props,
    ...h2Style,
    weight: customWeight ?? h2Style.weight,
    color: customColor ?? typographyColors.h2
  };

  return <IOText {...H2Props}>{props.children}</IOText>;
};
