import * as React from "react";
import { useMemo } from "react";
import { AccessibilityProps, StyleProp, Text, TextStyle } from "react-native";
import { IOFontFamily, IOFontWeight, makeFontStyleObject } from "../fonts";
import { IOColors, IOColorType } from "../variables/IOColors";

export type BaseTypographyProps = {
  weight: IOFontWeight;
  color: IOColorType;
  fontSize: number;
  font?: IOFontFamily;
  isItalic?: boolean;
  isUnderline?: boolean;
} & AccessibilityProps;

const calculateTextStyle = (
  weight: IOFontWeight,
  color: IOColorType,
  fontSize: number,
  font: IOFontFamily | undefined = "RobotoMono",
  isItalic: boolean | undefined = false,
  isUnderline: boolean | undefined = false
): StyleProp<TextStyle> => {
  return {
    ...makeFontStyleObject(weight, isItalic, font),
    color: IOColors[color],
    fontSize,
    textDecorationLine: isUnderline ? "underline" : undefined
  };
};

export const BaseTypography: React.FunctionComponent<
  BaseTypographyProps
> = props => {
  const fontStyle = useMemo(
    () =>
      calculateTextStyle(
        props.weight,
        props.color,
        props.fontSize,
        props.font,
        props.isItalic,
        props.isUnderline
      ),
    [props.font, props.weight, props.color, props.fontSize]
  );

  return (
    <Text style={fontStyle} {...props}>
      {props.children}
    </Text>
  );
};
