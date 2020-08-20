import * as React from "react";
import { useMemo } from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { IOFontFamily, IOFontWeight, makeFontStyleObject } from "../fonts";
import { IOColors, IOColorType } from "../variables/IOColors";

// TODO: create typography showroom
// TODO: Create test for typography components
// TODO: review comments & docs
// TODO: check with Laura the lineHeight

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

type OwnProps = BaseTypographyProps & {
  fontStyle?: StyleProp<TextStyle>;
} & Omit<React.ComponentPropsWithRef<typeof Text>, "style">;

/**
 * Decorate the function {@link makeFontStyleObject} with the additional color calculation.
 * @param color A value key from {@link IOColors}, transformed here in {@link ColorValue}
 * @param args the args of the function {@link makeFontStyleObject}
 */
const calculateTextStyle = (
  color: IOColorType,
  ...args: Parameters<typeof makeFontStyleObject>
) => ({
  ...makeFontStyleObject(...args),
  color: IOColors[color]
});

/**
 * `BaseTypography` is the core Typography component used to render a text.
 * It accepts all the default text style `StyleProp<TextStyle>` in addition with {@link BaseTypographyProps}
 * used to calculate at runtime the platform-dependent styles.
 * This component shouldn't be used in the application but only to compose others `Typography elements`.
 * @param props
 * @constructor
 */
export const BaseTypography: React.FunctionComponent<OwnProps> = props => {
  const fontStyle = useMemo(
    () =>
      calculateTextStyle(props.color, props.weight, props.isItalic, props.font),
    [props.color, props.weight, props.isItalic, props.font]
  );

  return (
    <Text style={[props.fontStyle, fontStyle]} {...props}>
      {props.children}
    </Text>
  );
};
