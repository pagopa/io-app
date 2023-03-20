import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface PlaceholderProps {
  color: string;
  placeHolderStyle?: ViewStyle;
  scalableDimension?: ViewStyle;
}

export const INPUT_PLACEHOLDER_HEIGHT = 40;

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
    borderBottomWidth: 2
  }
});

export const Bullet: React.FunctionComponent<PlaceholderProps> = ({
  color,
  scalableDimension
}) => (
  <View style={[styles.placeholder, scalableDimension]}>
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
      { borderBottomColor: color }
    ]}
  />
);
