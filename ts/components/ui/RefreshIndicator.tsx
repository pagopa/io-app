import { View } from "native-base";
import * as React from "react";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";

import variables from "../../theme/variables";
import { IOColors } from "../core/variables/IOColors";

const styles = StyleSheet.create({
  androidIndicatorInner: {
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: IOColors.white,
    width: 42,
    height: 42,
    elevation: 4,
    borderRadius: 42
  }
});

const isAndroid = Platform.OS === "android";

export const RefreshIndicator: React.FunctionComponent = () => {
  const activityIndicator = (
    <ActivityIndicator
      size={isAndroid ? 24 : "large"}
      color={isAndroid ? variables.brandPrimary : undefined}
      testID={"refreshIndicator"}
    />
  );
  return isAndroid ? (
    <View style={styles.androidIndicatorInner}>{activityIndicator}</View>
  ) : (
    activityIndicator
  );
};
