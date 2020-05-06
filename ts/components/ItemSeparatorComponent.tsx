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
    height: StyleSheet.hairlineWidth
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
          !this.props.noPadded && styles.horizontalPad
        ]}
      />
    );
  }
}
