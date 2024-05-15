import React from "react";
import { StyleSheet, View } from "react-native";
import { EIdCard } from "./EIdCard";

export const EIdCardPreview = () => (
  <View style={styles.previewContainer}>
    <EIdCard isMasked={true} />
  </View>
);

const styles = StyleSheet.create({
  previewContainer: {
    aspectRatio: 9 / 2,
    overflow: "hidden"
  }
});
