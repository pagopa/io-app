import React from "react";
import { StyleSheet, View } from "react-native";
import {
  H3,
  IOPictograms,
  IOStyles,
  IOVisualCostants,
  Pictogram,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";

const styles = StyleSheet.create({
  container: {
    marginHorizontal: IOVisualCostants.appMarginDefault
  },
  text: {
    textAlign: "center"
  }
});

export type EmptyStateProps = WithTestID<{
  pictogram: IOPictograms;
  title: string;
}>;

export const EmptyState = ({ pictogram, title, testID }: EmptyStateProps) => (
  <View style={styles.container} testID={testID}>
    <View style={IOStyles.alignCenter}>
      <Pictogram name={pictogram} size={120} />
      <VSpacer size={24} />
    </View>
    <H3 style={styles.text}>{title}</H3>
  </View>
);
