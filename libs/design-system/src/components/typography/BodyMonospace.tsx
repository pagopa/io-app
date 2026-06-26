import { useIOTheme } from "../../context";
import { bodyFontSize, bodyLineHeight } from "./Body";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

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
    dynamicTypeRamp: "body", // iOS only
    font: "FiraCode",
    weight: "Medium",
    size: bodyFontSize,
    lineHeight: bodyLineHeight,
    color: customColor ?? theme["textBody-tertiary"],
    textStyle: {
      letterSpacing: 0.5
    }
  };

  return <IOText {...BodyProps}>{props.children}</IOText>;
};
