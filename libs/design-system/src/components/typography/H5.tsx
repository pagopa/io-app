import { useIOTheme } from "../../context";
import { IOFontSize } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

export const h5FontSize: IOFontSize = 14;
export const h5LineHeight = 16;

/**
 * `H5` typographic style
 */
export const H5 = ({ color: customColor, ...props }: TypographicStyleProps) => {
  const theme = useIOTheme();

  const H5Props: IOTextProps = {
    ...props,
    dynamicTypeRamp: "subheadline", // iOS only
    weight: "Semibold",
    size: h5FontSize,
    lineHeight: h5LineHeight,
    color: customColor ?? theme["textHeading-default"],
    textStyle: {
      textTransform: "uppercase",
      letterSpacing: 0.5
    }
  };

  return <IOText {...H5Props}>{props.children}</IOText>;
};
