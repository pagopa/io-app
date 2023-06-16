import * as React from "react";
import { StyleSheet } from "react-native";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import { IOColors, hexToRgba } from "../core/variables/IOColors";

const opaqueBgColor = hexToRgba(IOColors.black, 0.2);

/**
 * Simple component used as background when the bottom sheet pops up to blur the background and demands its closing when tapping on it
 * @param onPress
 */
export const BlurredBackgroundComponent = (onPress: () => void) => (
  <TouchableDefaultOpacity
    accessible={true}
    onPress={onPress}
    style={{
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
      backgroundColor: opaqueBgColor
    }}
  />
);
