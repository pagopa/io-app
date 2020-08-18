import * as React from "react";
import { AccessibilityProps, StyleSheet, Text } from "react-native";
import { makeFontStyleObject } from "../fonts";
import { IOColors, IOColorType } from "../variables/IOColors";

type AllowedColors = Extract<IOColorType, "bluegreyDark" | "white">;

type OwnProps = { color?: AllowedColors } & AccessibilityProps;

const styles = StyleSheet.create({
  h1: { ...makeFontStyleObject("Bold"), fontSize: 28 }
});

export const H1: React.FunctionComponent<OwnProps> = props => {
  const styleColor =
    props.color !== undefined ? { color: IOColors[props.color] } : undefined;
  return (
    <Text style={[styles.h1, styleColor]} {...props}>
      {props.children}
    </Text>
  );
};
H1.defaultProps = {
  color: "bluegreyDark"
};
