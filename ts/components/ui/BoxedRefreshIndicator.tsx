import * as React from "react";
import { StyleSheet, View } from "react-native";
import customVariables from "../../theme/variables";
import { RefreshIndicator } from "./RefreshIndicator";

const styles = StyleSheet.create({
  refreshBox: {
    height: 100,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  whiteBg: {
    backgroundColor: customVariables.colorWhite
  }
});

interface Props {
  caption?: React.ReactNode;
  white?: boolean;
}

const BoxedRefreshIndicator: React.SFC<Props> = props => (
  <View style={[styles.refreshBox, props.white && styles.whiteBg]}>
    <RefreshIndicator />
    {props.caption ? props.caption : null}
  </View>
);

export default BoxedRefreshIndicator;
