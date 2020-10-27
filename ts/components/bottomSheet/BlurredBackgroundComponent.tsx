import * as React from "react";
import { StyleSheet } from "react-native";
import { View } from "native-base";

export const BlurredBackgroundComponent = () => (
  <View
    style={{
      ...StyleSheet.absoluteFillObject,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      overflow: "hidden",
      backgroundColor: "rgba(0,0,0, 0.5)"
    }}
  />
);
