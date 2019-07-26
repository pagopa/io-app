import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../theme/variables";

const styles = StyleSheet.create({
  itemSeparator: {
    backgroundColor: customVariables.itemSeparator,
    height: 1 / 3,
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding
  }
});

export default class ItemSeparatorComponent extends React.PureComponent<{}> {
  public render() {
    return <View style={styles.itemSeparator} />;
  }
}
