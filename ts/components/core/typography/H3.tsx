import * as React from "react";
import { useMemo } from "react";
import {
  AccessibilityProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle
} from "react-native";
import { FontFamily, FontWeight, makeFontStyleObject } from "../fonts";
import { IOColors, IOColorType } from "../variables/IOColors";

type AllowedSemiBoldColors = Extract<
  IOColorType,
  "bluegreyDark" | "bluegreyLight" | "white"
>;

type AllowedBoldColors = Extract<IOColorType, "white">;

type AllowedColors = AllowedBoldColors | AllowedSemiBoldColors;

type SemiBold = {
  weight?: Extract<FontWeight, "SemiBold">;
  color?: AllowedSemiBoldColors;
};
type Bold = { weight: Extract<FontWeight, "Bold">; color?: AllowedBoldColors };

type BoldProps = SemiBold | Bold;

const isBold = (configuration: Bold | SemiBold): configuration is Bold =>
  "weight" in configuration;

type OwnProps = AccessibilityProps & BoldProps;

const calculateWeightColor = (weight?: FontWeight, color?: AllowedColors) => {
  const newWeight = weight !== undefined ? weight : "SemiBold";
  const newColor =
    color !== undefined
      ? color
      : newWeight === "SemiBold"
        ? "bluegreyDark"
        : "white";
  return {
    weight: newWeight,
    color: newColor
  };
};

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

export const H3: React.FunctionComponent<OwnProps> = props => {
  const { weight, color } = useMemo(
    () => calculateWeightColor(props.weight, props.color),
    [props.weight, props.color]
  );
  const fontStyle = useMemo(
    () => calculateTextStyle("TitilliumWeb", weight, color, 18),
    [props.weight, props.color]
  );

  return (
    <Text style={fontStyle} {...props}>
      {props.children}
    </Text>
  );
};
