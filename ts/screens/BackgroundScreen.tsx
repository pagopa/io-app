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
class BackgroundScreen extends React.Component<never, never> {
  public render() {
    return <Container style={styles.container} />;
  }
}

export default BackgroundScreen;
