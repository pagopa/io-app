import React from "react";
import { StyleSheet, View } from "react-native";
import { EidCard } from "./EidCard";

export const EidCardPreview = () => (
  <View style={styles.previewContainer}>
    <EidCard isMasked={true} />
  </View>
);

const styles = StyleSheet.create({
  previewContainer: {
    aspectRatio: 9 / 2,
    overflow: "hidden"
  }
});
