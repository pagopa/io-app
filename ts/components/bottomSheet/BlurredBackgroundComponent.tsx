import * as React from "react";
import { StyleSheet } from "react-native";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";

/**
 * Simple component used as background when the bottom sheet pops up to blur the background and demands its closing when tapping on it
 * @param onPress
 */
export const BlurredBackgroundComponent = (onPress: () => void) => (
  <TouchableDefaultOpacity
    onPress={onPress}
    style={{
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
      backgroundColor: "rgba(0,0,0, 0.5)"
    }}
  />
);
