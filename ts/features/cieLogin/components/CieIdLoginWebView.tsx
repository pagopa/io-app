import { View, Text } from "react-native";
import React from "react";

export type SpidLevel = "SpidL2" | "SpidL3";

export type CieIdLoginProps = {
  isUat?: boolean;
};

const CieIdLoginWebView = (_: CieIdLoginProps) => (
  <View>
    <Text>CieIdLoginWebView</Text>
  </View>
);

export default CieIdLoginWebView;
