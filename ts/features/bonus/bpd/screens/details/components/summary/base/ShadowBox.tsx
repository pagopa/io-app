import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  body: {
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#00274e",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
    flex: 1
  },
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16
  }
});

/**
 * A base shadowed box with a content
 * @param props
 * @constructor
 */
export const ShadowBox: React.FunctionComponent = props => (
  <View style={styles.body}>
    <View style={styles.container}>{props.children}</View>
  </View>
);
