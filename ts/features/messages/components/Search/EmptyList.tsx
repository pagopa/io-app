import {
  H6,
  IOPictograms,
  IOStyles,
  IOVisualCostants,
  Pictogram,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    marginHorizontal: IOVisualCostants.appMarginDefault
  },
  text: {
    textAlign: "center"
  }
});

export type EmptyListProps = WithTestID<{
  pictogram: IOPictograms;
  title: string;
}>;

export const EmptyList = ({ pictogram, title, testID }: EmptyListProps) => (
  <View style={styles.container} testID={testID}>
    <View style={IOStyles.alignCenter}>
      <Pictogram name={pictogram} size={120} />
      <VSpacer size={24} />
    </View>
    <H6 style={styles.text}>{title}</H6>
  </View>
);
