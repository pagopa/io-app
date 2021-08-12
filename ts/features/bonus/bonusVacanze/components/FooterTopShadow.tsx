import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import variables from "../../../../theme/variables";

// TODO: after bonus vacanze,create a common style for footer, atm duplicated in FooterWithButtons
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
 * A generic component that can be used to draw shadow on top
 * @param props
 * @constructor
 */
export const FooterTopShadow: React.FunctionComponent = props => (
  <View style={styles.container}>
    <View style={styles.footerVariant}>{props.children}</View>
  </View>
);
