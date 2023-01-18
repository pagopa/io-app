/**
 * A component to display a white tick on a blue background
 */
import * as React from "react";
import { View, StatusBar, StyleSheet } from "react-native";

import variables from "../theme/variables";
import IconFont from "./ui/IconFont";
import { IOColors } from "./core/variables/IOColors";

const styles = StyleSheet.create({
  container: {
    backgroundColor: variables.brandPrimary,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const tickSize = variables.iconSize6 * 2;

export const IdpSuccessfulAuthentication = () => (
  <View style={styles.container}>
    <StatusBar
      barStyle="light-content"
      backgroundColor={styles.container.backgroundColor}
    />
    <IconFont name="io-tick-big" color={IOColors.white} size={tickSize} />
  </View>
);
