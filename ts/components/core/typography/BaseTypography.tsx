import * as React from "react";
import { useMemo } from "react";
import { AccessibilityProps, StyleProp, Text, TextStyle } from "react-native";
import { IOFontFamily, IOFontWeight, makeFontStyleObject } from "../fonts";
import { IOColors, IOColorType } from "../variables/IOColors";

export type BaseTypographyProps = {
  font: IOFontFamily;
  weight: IOFontWeight;
  color: IOColorType;
  fontSize: number;
} & AccessibilityProps;

const calculateTextStyle = (
  font: IOFontFamily,
  weight: IOFontWeight,
  color: IOColorType,
  fontSize: number
): StyleProp<TextStyle> => {
  return {
    ...makeFontStyleObject(weight, false, font),
    color: IOColors[color],
    fontSize
  };
};

export const BaseTypography: React.FunctionComponent<
  BaseTypographyProps
> = props => {
  const fontStyle = useMemo(
    () =>
      calculateTextStyle(props.font, props.weight, props.color, props.fontSize),
    [props.font, props.weight, props.color, props.fontSize]
  );

  return (
    <Text style={fontStyle} {...props}>
      {props.children}
    </Text>
  );
};
