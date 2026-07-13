import { useIOTheme } from "../../../context";
import { IOText, IOTextProps, TypographicStyleProps } from "../IOText";

/**
 * `MdH3` typographic style
 */
export const MdH3 = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const theme = useIOTheme();

  const MdH3Props: IOTextProps = {
    ...props,
    weight: "Semibold",
    size: 16,
    lineHeight: 24,
    color: customColor ?? theme["textHeading-default"]
  };

  return <IOText {...MdH3Props}>{props.children}</IOText>;
};
