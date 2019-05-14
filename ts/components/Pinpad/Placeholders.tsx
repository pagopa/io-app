import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

interface PlaceholderProps {
  color: string;
}

const styles = StyleSheet.create({
  placeholder: {
    height: 40,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 18,
    width: 36,
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

export const Bullet: React.SFC<PlaceholderProps> = ({ color }) => (
  <View style={styles.placeholder}>
    <View style={[styles.placeholderBullet, { backgroundColor: color }]} />
  </View>
);

export const Baseline: React.SFC<PlaceholderProps> = ({ color }) => (
  <View
    style={[
      styles.placeholder,
      styles.placeholderBaseline,
      { borderBottomColor: color }
    ]}
  />
);
