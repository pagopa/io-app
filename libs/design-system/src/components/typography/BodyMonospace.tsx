import { useIOTheme } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const {
  bodyMonospace: { colorToken, ...bodyMonospaceStyle }
} = IOTypography;

/**
 * `BodyMonospace` typographic style
 */
export const BodyMonospace = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const theme = useIOTheme();

  const BodyProps: IOTextProps = {
    ...props,
    ...bodyMonospaceStyle,
    color: customColor ?? theme[colorToken]
  };

  return <IOText {...BodyProps}>{props.children}</IOText>;
};
