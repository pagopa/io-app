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

const isAndroid = Platform.OS === "android";

export const RefreshIndicator: React.SFC<{}> = () => {
  const activityIndicator = (
    <ActivityIndicator
      size={isAndroid ? 24 : "large"}
      color={isAndroid ? variables.brandPrimary : undefined}
    />
  );
  return isAndroid ? (
    <View style={styles.androidIndicatorInner}>{activityIndicator}</View>
  ) : (
    activityIndicator
  );
};
