import * as React from "react";

import { StyleSheet, View } from "react-native";
import variables from "../../theme/variables";
import { IOStyles } from "../core/variables/IOStyles";
import BlockButtons, { BlockButtonsProps } from "./BlockButtons";

// TODO: Refactor with an unique component like `FooterTopShadow` after bonus vacanze
const styles = StyleSheet.create({
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
      <View
        style={styles.container}
        accessible={this.props.accessible}
        pointerEvents={"box-none"}
        testID="FooterWithButtons"
      >
        <View style={IOStyles.footer}>
          <BlockButtons {...this.props} />
        </View>
      </View>
    );
  }
}
