import { useIOTheme } from "../../context";
import { IOFontSize } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

export const h1FontSize: IOFontSize = 28;
export const h1LineHeight = 42;

/**
 * `H1` typographic style
 */
export const H1 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();

  const H1Props: IOTextProps = {
    ...props,
    dynamicTypeRamp: "largeTitle", // iOS only
    weight: "Semibold",
    size: h1FontSize,
    lineHeight: h1LineHeight,
    color: customColor ?? theme["textHeading-default"]
  };

  return <IOText {...H1Props}>{props.children}</IOText>;
};
