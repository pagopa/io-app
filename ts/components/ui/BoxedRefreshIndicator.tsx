import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { LoadingIndicator } from "./LoadingIndicator";

const styles = StyleSheet.create({
  refreshBox: {
    height: 100,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  whiteBg: {
    backgroundColor: IOColors.white
  }
});

type Props = {
  action?: React.ReactNode;
  caption?: React.ReactNode;
  white?: boolean;
};

const BoxedRefreshIndicator = ({ action, caption, white }: Props) => (
  <View style={[styles.refreshBox, white && styles.whiteBg]}>
    <LoadingIndicator testID="refreshIndicator" />
    {caption ? caption : null}
    {action ? action : null}
  </View>
);

export default BoxedRefreshIndicator;
