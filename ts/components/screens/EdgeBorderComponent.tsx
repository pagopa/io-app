import { View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  emptyListWrapper: {
    alignItems: "center",
    marginTop: 74
  }
});

export class EdgeBorderComponent extends React.PureComponent<{}> {
  public render() {
    return (
      <View style={styles.emptyListWrapper}>
        <Image source={require("../../../img/messages/smile.png")} />
      </View>
    );
  }
}
