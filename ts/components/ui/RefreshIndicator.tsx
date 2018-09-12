import { View } from "native-base";
import * as React from "react";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";

import variables from "../../theme/variables";

const styles = StyleSheet.create({
  androidIndicatorInner: {
    justifyContent: "center",
    backgroundColor: variables.colorWhite,
    width: 42,
    height: 42,
    elevation: 4,
    borderRadius: 42
  }
});

export const RefreshIndicator: React.SFC<{}> = () => (
  <View style={Platform.OS === "android" && styles.androidIndicatorInner}>
    <ActivityIndicator size={24} color={variables.brandPrimary} />
  </View>
);
