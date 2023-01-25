import * as React from "react";
import { View, StyleSheet } from "react-native";
import IconFont from "../ui/IconFont";
import { IOColors } from "../core/variables/IOColors";
import { HSpacer } from "../core/spacer/Spacer";

type Props = {
  iconName?: string;
  iconColor?: string;
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
  },
  icon: {
    marginTop: 4,
    alignSelf: "flex-start"
  }
});

const ICON_SIZE = 32;

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
      <IconFont
        name={iconName}
        size={iconSize}
        color={iconColor}
        style={styles.icon}
      />
      <HSpacer size={16} />
      <View style={styles.shrink}>{props.children}</View>
    </View>
  );
};
