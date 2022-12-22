import * as React from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  emptyListWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 40,
    marginBottom: 40,
    height: 32
  }
});

export class EdgeBorderComponent extends React.PureComponent {
  public render() {
    return <View style={styles.emptyListWrapper} />;
  }
}
