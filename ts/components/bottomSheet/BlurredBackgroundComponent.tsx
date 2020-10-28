import * as React from "react";
import { StyleSheet } from "react-native";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";

export const BlurredBackgroundComponent = (onPress: ()=> void) => (
  <TouchableDefaultOpacity
    onPress={onPress}
    style={{
      ...StyleSheet.absoluteFillObject,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      overflow: "hidden",
      backgroundColor: "rgba(0,0,0, 0.5)"
    }}
  />
);
