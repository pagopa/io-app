import * as React from "react";
import { StyleSheet, View } from "react-native";
import { RefreshIndicator } from "./RefreshIndicator";

const styles = StyleSheet.create({
  refreshBox: {
    height: 100,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

interface Props {
  caption?: React.ReactNode;
}

const BoxedRefreshIndicator: React.SFC<Props> = props => (
  <View style={styles.refreshBox}>
    <RefreshIndicator />
    {props.caption ? props.caption : null}
  </View>
);

export default BoxedRefreshIndicator;
