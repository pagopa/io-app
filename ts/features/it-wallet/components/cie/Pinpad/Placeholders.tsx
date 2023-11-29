import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface PlaceholderProps {
  color: string;
  baselineColor?: string;
  placeHolderStyle?: ViewStyle;
  scalableDimension?: ViewStyle;
}

export const INPUT_PLACEHOLDER_HEIGHT = 60;

const styles = StyleSheet.create({
  placeholder: {
    height: INPUT_PLACEHOLDER_HEIGHT,
    alignItems: "center",
    justifyContent: "center"
  },
  placeholderBullet: {
    borderRadius: 10,
    height: 10,
    width: 10
  },
  placeholderBaseline: {
    borderWidth: 2,
    borderRadius: 8
  }
});

export const Bullet: React.FunctionComponent<PlaceholderProps> = ({
  color,
  baselineColor,
  scalableDimension,
  placeHolderStyle
}) => (
  <View
    style={[
      styles.placeholder,
      [styles.placeholderBaseline, placeHolderStyle],
      scalableDimension,
      { borderColor: baselineColor }
    ]}
  >
    <View style={[styles.placeholderBullet, { backgroundColor: color }]} />
  </View>
);

export const Baseline: React.FunctionComponent<PlaceholderProps> = ({
  color,
  placeHolderStyle,
  scalableDimension
}) => (
  <View
    style={[
      styles.placeholder,
      [styles.placeholderBaseline, placeHolderStyle],
      scalableDimension,
      { borderColor: color }
    ]}
  />
);
