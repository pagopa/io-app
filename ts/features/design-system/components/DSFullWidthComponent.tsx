import * as React from "react";
import { View, StyleSheet } from "react-native";
import customVariables from "../../../theme/variables";

type Props = {
  children: React.ReactNode;
};

const styles = StyleSheet.create({
  container: {
    marginLeft: customVariables.contentPadding * -1,
    marginRight: customVariables.contentPadding * -1
  }
});

export const DSFullWidthComponent = ({ children }: Props) => (
  <View style={styles.container}>{children}</View>
);
