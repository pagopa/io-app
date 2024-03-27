import {
  IOColors,
  IOStyles,
  ListItemAction,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    paddingBottom: "95%",
    marginBottom: "-95%",
    paddingHorizontal: IOStyles.horizontalContentPadding.paddingHorizontal,
    paddingTop: IOStyles.footer.paddingTop
  }
});

export const MessageFooter = () => (
  <View style={styles.container}>
    <VSpacer size={16} />
  </View>
);
