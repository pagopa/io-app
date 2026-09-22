import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

/* `color` is a static value and not a theme token because `IOButton` and
`SearchInput` animate it through Reanimated */
const {
  buttonText: { color: defaultColor, ...buttonTextStyle }
} = IOTypography;

/**
 * `ButtonText` typographic style
 */
export const ButtonText = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const ButtonTextProps: IOTextProps = {
    ...props,
    ...buttonTextStyle,
    color: customColor ?? defaultColor
  };

  return <IOText {...ButtonTextProps}>{props.children}</IOText>;
};
