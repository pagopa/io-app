import { View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  emptyListWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 40,
    marginBottom: 40
  }
});

export class EdgeBorderComponent extends React.PureComponent {
  public render() {
    return (
      <React.Fragment>
        <View style={styles.emptyListWrapper}>
          <Image source={require("../../../img/messages/smile.png")} />
        </View>
        <View spacer={true} />
      </React.Fragment>
    );
  }
}
