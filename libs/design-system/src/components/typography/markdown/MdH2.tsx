import { useIOTheme } from "../../../context";
import { IOText, IOTextProps, TypographicStyleProps } from "../IOText";

/**
 * `MdH2` typographic style
 */
export const MdH2 = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const theme = useIOTheme();

  const MdH2Props: IOTextProps = {
    ...props,
    weight: "Semibold",
    size: 18,
    lineHeight: 24,
    color: customColor ?? theme["textHeading-default"]
  };

  return <IOText {...MdH2Props}>{props.children}</IOText>;
};
