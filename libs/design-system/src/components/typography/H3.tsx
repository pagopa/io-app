import { useIOTheme } from "../../context";
import { IOFontSize } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

/* Common typographic styles */
export const h3FontSize: IOFontSize = 22;
export const h3LineHeight = 33;

/**
 * `H3` typographic style
 */
export const H3 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();

  const H3Props: IOTextProps = {
    ...props,
    dynamicTypeRamp: "title2", // iOS only
    weight: "Semibold",
    size: h3FontSize,
    lineHeight: h3LineHeight,
    color: customColor ?? theme["textHeading-default"]
  };

  return <IOText {...H3Props}>{props.children}</IOText>;
};
