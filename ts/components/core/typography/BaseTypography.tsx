import * as React from "react";
import { useMemo } from "react";
import { AccessibilityProps, StyleProp, Text, TextStyle } from "react-native";
import { IOFontFamily, IOFontWeight, makeFontStyleObject } from "../fonts";
import { IOColors, IOColorType } from "../variables/IOColors";

// TODO: export all the Text props without style
// TODO: create typography showroom
// TODO: Create test for typography components
// TODO: review comments & docs
// TODO: check lineHeight, textspacing

/***
 * The specific properties needed to calculate the font style using {@link makeFontStyleObject} (these information
 * cannot be included in the default StyleProp<TextStyle>
 */
type BaseTypographyProps = {
  weight: IOFontWeight;
  color: IOColorType;
  font?: IOFontFamily;
  isItalic?: boolean;
};

export type InputTypographyProps = BaseTypographyProps &
  AccessibilityProps & {
    fontStyle?: StyleProp<TextStyle>;
  };

const calculateTextStyle = (
  weight: IOFontWeight,
  color: IOColorType,
  font: IOFontFamily | undefined = "RobotoMono",
  isItalic: boolean | undefined = false
): StyleProp<TextStyle> => {
  return {
    ...makeFontStyleObject(weight, isItalic, font),
    color: IOColors[color]
  };
};

/**
 * BaseTypography is the core Typography component used to render a text.
 * It accepts all the default text style StyleProp<TextStyle> in addition with {@link BaseTypographyProps}
 * used to calculate at runtime the platform-dependent styles.
 * @param props
 * @constructor
 */
export const BaseTypography: React.FunctionComponent<
  InputTypographyProps
> = props => {
  const fontStyle = useMemo(
    () =>
      calculateTextStyle(props.weight, props.color, props.font, props.isItalic),
    [props.weight, props.color, props.font, props.isItalic]
  );

  return (
    <Text style={[props.fontStyle, fontStyle]} {...props}>
      {props.children}
    </Text>
  );
};
