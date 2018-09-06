import { Container } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import variables from "../theme/variables";

const styles = StyleSheet.create({
  container: {
    backgroundColor: variables.brandPrimary
  }
});

/**
 * An screen used when the App is in background.
 */
const BackgroundScreen: React.SFC<never> = () => (
  <Container style={styles.container} />
);

export default BackgroundScreen;
