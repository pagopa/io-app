import { useIOTheme } from "../../context";
import { IOFontSize } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

export const h4FontSize: IOFontSize = 20;
export const h4LineHeight = 24;

/**
 * `H4` typographic style
 */
export const H4 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();

  const H4Props: IOTextProps = {
    ...props,
    dynamicTypeRamp: "title3", // iOS only
    weight: "Semibold",
    size: h4FontSize,
    lineHeight: h4LineHeight,
    color: customColor ?? theme["textHeading-default"]
  };

  return <IOText {...H4Props}>{props.children}</IOText>;
};
