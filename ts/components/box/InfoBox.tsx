import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IOColors } from "../core/variables/IOColors";
import { HSpacer } from "../core/spacer/Spacer";
import { IOIconSizeScale, IOIcons, Icon } from "../core/icons";

type Props = {
  iconName?: IOIcons;
  iconColor?: IOColors;
  iconSize?: IOIconSizeScale;
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

const ICON_SIZE: IOIconSizeScale = 32;

/**
 * This component display a box with an icon and a component on the right.
 * @param props
 * @constructor
 */
export const InfoBox: React.FunctionComponent<Props> = props => {
  const iconName = props.iconName ?? "notice";
  const iconColor = props.iconColor ?? "blue";
  const iconSize = props.iconSize ?? ICON_SIZE;
  const centralAlignment = props.alignedCentral ? styles.alignedCentral : {};
  return (
    <View style={[styles.row, centralAlignment]}>
      <View style={styles.icon}>
        <Icon name={iconName} size={iconSize} color={iconColor} />
      </View>
      <HSpacer size={16} />
      <View style={styles.shrink}>{props.children}</View>
    </View>
  );
};
