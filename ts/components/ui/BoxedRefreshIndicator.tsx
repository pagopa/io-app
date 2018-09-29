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

export default class BoxedRefreshIndicator extends React.Component {
  public render() {
    return (
      <View style={styles.refreshBox}>
        <RefreshIndicator />
      </View>
    );
  }
}
