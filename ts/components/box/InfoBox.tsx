import { View } from "native-base";
import * as React from "react";
import { ColorValue, StyleSheet } from "react-native";
import IconFont from "../ui/IconFont";
import { IOColors } from "../core/variables/IOColors";

type Props = {
  iconName?: string;
  iconColor?: ColorValue;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  shrink: {
    flexShrink: 1
  }
});

const iconSize = 24;

/**
 * This component display a box with an icon and a component on the right.
 * @param props
 * @constructor
 */
export const InfoBox: React.FunctionComponent<Props> = props => {
  const iconName = props.iconName ?? "io-notice";
  const iconColor = props.iconColor ?? IOColors.blue;
  return (
    <View style={styles.row}>
      <IconFont name={iconName} size={iconSize} color={iconColor as string} />
      <View hspacer={true} />
      <View style={styles.shrink}>{props.children}</View>
    </View>
  );
};
