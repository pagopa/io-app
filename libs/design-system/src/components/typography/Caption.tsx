import { useIOTheme } from "../../context";
import { IOFontSize } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

export const captionFontSize: IOFontSize = 12;

/**
 * `Caption` typographic style
 */
export const Caption = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const theme = useIOTheme();

  const CaptionProps: IOTextProps = {
    ...props,
    dynamicTypeRamp: "caption1", // iOS only
    weight: "Regular",
    size: captionFontSize,
    color: customColor ?? theme["textBody-default"],
    textStyle: {
      textTransform: "uppercase",
      letterSpacing: 0.5
    }
  };

  return <IOText {...CaptionProps}>{props.children}</IOText>;
};
