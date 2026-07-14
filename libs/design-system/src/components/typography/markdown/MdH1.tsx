import { useIOTheme } from "../../../context";
import { IOText, IOTextProps, TypographicStyleProps } from "../IOText";

/**
 * `MdH1` typographic style
 */
export const MdH1 = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const theme = useIOTheme();

  const MdH1Props: IOTextProps = {
    ...props,
    weight: "Semibold",
    size: 20,
    lineHeight: 24,
    color: customColor ?? theme["textHeading-default"]
  };

  return <IOText {...MdH1Props}>{props.children}</IOText>;
};
