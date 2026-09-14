import { useIOTheme } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const {
  caption: { colorToken, ...captionStyle }
} = IOTypography;

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
    ...captionStyle,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...CaptionProps}>{props.children}</IOText>;
};
