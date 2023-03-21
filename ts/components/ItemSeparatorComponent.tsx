import * as React from "react";
import { View, StyleSheet } from "react-native";
import customVariables from "../theme/variables";

type Props = Readonly<{
  noPadded?: boolean;
  bold?: boolean;
}>;

const styles = StyleSheet.create({
  itemSeparator: {
    backgroundColor: customVariables.itemSeparator
  },
  smallHeight: {
    height: StyleSheet.hairlineWidth
  },
  boldHeight: {
    height: 2
  },
  horizontalPad: {
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding
  }
});

export default class ItemSeparatorComponent extends React.PureComponent<Props> {
  public render() {
    return (
      <View
        style={[
          styles.itemSeparator,
          !this.props.noPadded && styles.horizontalPad,
          this.props.bold ? styles.boldHeight : styles.smallHeight
        ]}
      />
    );
  }
}
