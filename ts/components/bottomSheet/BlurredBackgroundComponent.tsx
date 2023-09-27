import * as React from "react";
import { StyleSheet } from "react-native";
import { IOColors, hexToRgba } from "@pagopa/io-app-design-system";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";

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
