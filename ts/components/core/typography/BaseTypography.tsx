import * as React from "react";
import { useMemo } from "react";
import { AccessibilityProps, StyleProp, Text, TextStyle } from "react-native";
import { FontFamily, FontWeight, makeFontStyleObject } from "../fonts";
import { IOColors, IOColorType } from "../variables/IOColors";

type BaseTypographyProps = {
  font: FontFamily;
  weight: FontWeight;
  color: IOColorType;
  fontSize: number;
} & AccessibilityProps;

const calculateTextStyle = (
  font: FontFamily,
  weight: FontWeight,
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
