import * as React from "react";
import { useMemo } from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { IOFontFamily, IOFontWeight, makeFontStyleObject } from "../fonts";
import { IOColors } from "../variables/IOColors";

/**
 * The specific properties needed to calculate the font style using {@link makeFontStyleObject} (these information
 * cannot be included in the default StyleProp<TextStyle>
 */
type BaseTypographyProps = {
  weight: IOFontWeight;
  color: IOColors;
  font?: IOFontFamily;
  isItalic?: boolean;
};

type OwnProps = BaseTypographyProps & {
  fontStyle?: StyleProp<TextStyle>;
} & React.ComponentPropsWithRef<typeof Text>;

/**
 * Decorate the function {@link makeFontStyleObject} with the additional color calculation.
 * @param color A value key from {@link IOColors}, transformed here in {@link ColorValue}
 * @param args the args of the function {@link makeFontStyleObject}
 */
const calculateTextStyle = (
  color: IOColors,
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
  const style = props.style
    ? [props.style, props.fontStyle, fontStyle]
    : [props.fontStyle, fontStyle];

  return (
    <Text {...props} style={style}>
      {props.children}
    </Text>
  );
};
