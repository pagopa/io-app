/**
 * A component to display a white tick on a blue background
 */
import * as React from "react";
import { View, StatusBar, StyleSheet } from "react-native";

import { IOIconSizeScale, Icon } from "@pagopa/io-app-design-system";
import variables from "../theme/variables";

const styles = StyleSheet.create({
  container: {
    backgroundColor: variables.brandPrimary,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const ICON_SIZE: IOIconSizeScale = 96;

export const IdpSuccessfulAuthentication = () => (
  <View style={styles.container}>
    <StatusBar
      barStyle="light-content"
      backgroundColor={styles.container.backgroundColor}
    />
    <Icon name="checkTickBig" color="white" size={ICON_SIZE} />
  </View>
);
