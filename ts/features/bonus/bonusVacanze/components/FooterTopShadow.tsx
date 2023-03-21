import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import variables from "../../../../theme/variables";

// TODO: after bonus vacanze,create a common style for footer, atm duplicated in FooterWithButtons
const styles = StyleSheet.create({
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
    <View style={IOStyles.footer}>{props.children}</View>
  </View>
);
