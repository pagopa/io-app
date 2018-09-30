import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import variables from "../theme/variables";
import IconFont from "./ui/IconFont";

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
    <IconFont name="io-tick-big" color={variables.colorWhite} size={tickSize} />
  </View>
);
