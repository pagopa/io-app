import { View } from "native-base";
import * as React from "react";
import { ColorValue, StyleSheet } from "react-native";
import IconFont from "../ui/IconFont";
import { IOColors } from "../core/variables/IOColors";

type Props = {
  iconName?: string;
  iconColor?: ColorValue;
  iconSize?: number;
  alignedCentral?: boolean;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  shrink: {
    flexShrink: 1
  },
  alignedCentral: {
    alignItems: "center"
  }
});

const ICON_SIZE = 24;

/**
 * This component display a box with an icon and a component on the right.
 * @param props
 * @constructor
 */
export const InfoBox: React.FunctionComponent<Props> = props => {
  const iconName = props.iconName ?? "io-notice";
  const iconColor = props.iconColor ?? IOColors.blue;
  const iconSize = props.iconSize ?? ICON_SIZE;
  const centralAlignment = props.alignedCentral ? styles.alignedCentral : {};
  return (
    <View style={[styles.row, centralAlignment]}>
      <IconFont name={iconName} size={iconSize} color={iconColor as string} />
      <View hspacer={true} />
      <View style={styles.shrink}>{props.children}</View>
    </View>
  );
};
