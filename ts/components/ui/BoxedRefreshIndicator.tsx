import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors } from "../core/variables/IOColors";
import { RefreshIndicator } from "./RefreshIndicator";

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

interface Props {
  caption?: React.ReactNode;
  white?: boolean;
  action?: React.ReactNode;
}

const BoxedRefreshIndicator: React.SFC<Props> = props => (
  <View style={[styles.refreshBox, props.white && styles.whiteBg]}>
    <RefreshIndicator />
    {props.caption ? props.caption : null}
    {props.action ? props.action : null}
  </View>
);

export default BoxedRefreshIndicator;
