import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IOColors } from "../../../../../../../../components/core/variables/IOColors";

const styles = StyleSheet.create({
  body: {
    borderRadius: 8,
    backgroundColor: IOColors.white,
    shadowColor: IOColors.bluegreyDark,
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.0,
    elevation: 4,
    flex: 1,
    marginHorizontal: 2
  },
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16
  }
});

/**
 * A base shadowed box with a content
 * @param props
 * @constructor
 */
export const ShadowBox: React.FunctionComponent = props => (
  <View style={styles.body}>
    <View style={styles.container}>{props.children}</View>
  </View>
);
