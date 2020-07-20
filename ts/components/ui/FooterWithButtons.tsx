import { View } from "native-base";
import * as React from "react";
import variables from "../../theme/variables";
import BlockButtons, { BlockButtonsProps } from "./BlockButtons";

import { StyleSheet } from "react-native";

// TODO: Refactor with an unique component like `FooterTopShadow` after bonus vacanze
const styles = StyleSheet.create({
  footerVariant: {
    backgroundColor: variables.footerBackground,
    paddingBottom: variables.footerPaddingBottom,
    paddingLeft: variables.footerPaddingLeft,
    paddingRight: variables.footerPaddingRight,
    paddingTop: variables.footerPaddingTop,
    // iOS shadow
    shadowColor: variables.footerShadowColor,
    shadowOffset: {
      width: variables.footerShadowOffsetWidth,
      height: variables.footerShadowOffsetHeight
    },
    shadowOpacity: variables.footerShadowOpacity,
    shadowRadius: variables.footerShadowRadius,
    // Android shadow
    elevation: variables.footerElevation
  },
  container: {
    overflow: "hidden",
    marginTop: -variables.footerShadowOffsetHeight,
    paddingTop: variables.footerShadowOffsetHeight
  }
});

/**
 * Implements a component that show buttons as sticky footer
 * It can include 1, 2 or 3 buttons. If they are 2, they can have the inlineHalf  or the inlineOneThird style
 */
export default class FooterWithButtons extends React.Component<
  BlockButtonsProps,
  never
> {
  public render() {
    return (
      <View style={styles.container} accessible={this.props.accessible}>
        <View style={styles.footerVariant}>
          <BlockButtons {...this.props} />
        </View>
      </View>
    );
  }
}
