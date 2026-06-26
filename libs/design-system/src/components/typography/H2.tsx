import { useIOTheme } from "../../context";
import { IOFontSize, IOFontWeight } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

type H2StyleProps = TypographicStyleProps & {
  weight?: Extract<IOFontWeight, "Semibold" | "Bold">;
};

export const h2FontSize: IOFontSize = 26;
export const h2LineHeight = 34;

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
    dynamicTypeRamp: "title1", // iOS only
    weight: customWeight ?? "Semibold",
    size: h2FontSize,
    lineHeight: h2LineHeight,
    color: customColor ?? theme["textHeading-default"]
  };

  return <IOText {...H2Props}>{props.children}</IOText>;
};
