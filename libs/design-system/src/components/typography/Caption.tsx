import { useIOColors } from "../../context";
import { IOTypography } from "../../core";
import { IOText, IOTextProps, TypographicStyleProps } from "./IOText";

const { caption: captionStyle } = IOTypography;

/** `Caption` typographic style */
export const Caption = ({
  color: customColor,
  ...props
}: TypographicStyleProps) => {
  const typographyColors = useIOColors().component.typography;

  const CaptionProps: IOTextProps = {
    ...props,
    ...captionStyle,
    color: customColor ?? typographyColors.caption
  };

  return <IOText {...CaptionProps}>{props.children}</IOText>;
};
