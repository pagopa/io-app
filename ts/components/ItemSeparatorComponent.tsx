import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../theme/variables";

type Props = Readonly<{
  noPadded?: boolean;
}>;

const styles = StyleSheet.create({
  itemSeparator: {
    backgroundColor: customVariables.itemSeparator,
    height: 0.33
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  }
});

export default class ItemSeparatorComponent extends React.PureComponent<Props> {
  public render() {
    return (
      <React.Fragment>
        <View
          style={[styles.itemSeparator, !this.props.noPadded && styles.padded]}
        />
        <View
          style={[styles.itemSeparator, !this.props.noPadded && styles.padded]}
        />
      </React.Fragment>
    );
  }
}
