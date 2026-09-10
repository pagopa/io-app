import { useIOTheme } from "../../context";
import { IOTypography } from "../../core";
import { IOFontWeight } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

type H2StyleProps = TypographicStyleProps & {
  weight?: Extract<IOFontWeight, "Bold" | "Semibold">;
};

const {
  h2: { colorToken, ...h2Style }
} = IOTypography;

/**
 * `H2` typographic style
 */
export const H2 = ({
  weight: customWeight,
  color: customColor,
  ...props
}: H2StyleProps) => {
  const theme = useIOTheme();

  const H2Props: IOTextProps = {
    ...props,
    ...h2Style,
    weight: customWeight ?? h2Style.weight,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...H2Props}>{props.children}</IOText>;
};
