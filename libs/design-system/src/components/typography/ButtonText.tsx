import { IOColors } from "../../core";
import { IOFontSize } from "../../utils/fonts";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

export const buttonTextFontSize: IOFontSize = 16;
export const buttonTextLineHeight = 20;

/* Needed to render `ButtonOutline` and`ButtonLink` because they use
`AnimatedText` for color transition through Reanimated */
const defaultColor: IOColors = "white";

/**
 * `ButtonText` typographic style
 */
export const ButtonText = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const ButtonTextProps: IOTextProps = {
    ...props,
    weight: "Semibold",
    size: buttonTextFontSize,
    lineHeight: buttonTextLineHeight,
    /* Needed to render `ButtonOutline` and`ButtonLink` because they use
`AnimatedText` for color transition through Reanimated */
    color: customColor ?? defaultColor
  };

  return <IOText {...ButtonTextProps}>{props.children}</IOText>;
};
