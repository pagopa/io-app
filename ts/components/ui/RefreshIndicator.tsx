import { View, ActivityIndicator, Platform, StyleSheet } from "react-native";

import { IOColors } from "@pagopa/io-app-design-system";
import variables from "../../theme/variables";

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

export const RefreshIndicator = (props: { testID?: string }) => {
  const activityIndicator = (
    <ActivityIndicator
      size={isAndroid ? 24 : "large"}
      color={isAndroid ? variables.brandPrimary : undefined}
      testID={props.testID ?? "refreshIndicator"}
    />
  );
  return isAndroid ? (
    <View style={styles.androidIndicatorInner}>{activityIndicator}</View>
  ) : (
    activityIndicator
  );
};
