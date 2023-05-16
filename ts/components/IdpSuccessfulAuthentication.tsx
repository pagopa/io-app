/**
 * A component to display a white tick on a blue background
 */
import * as React from "react";
import { View, StatusBar, StyleSheet } from "react-native";

import variables from "../theme/variables";
import { Icon } from "./core/icons";

const styles = StyleSheet.create({
  container: {
    backgroundColor: variables.brandPrimary,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const ICON_SIZE = 96;

export const IdpSuccessfulAuthentication = () => (
  <View style={styles.container}>
    <StatusBar
      barStyle="light-content"
      backgroundColor={styles.container.backgroundColor}
    />
    <Icon name="legCompleted" color="white" size={ICON_SIZE} />
  </View>
);
