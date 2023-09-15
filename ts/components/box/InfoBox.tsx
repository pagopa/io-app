import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  IOColors,
  IOIconSizeScale,
  IOIcons,
  Icon,
  HSpacer
} from "@pagopa/io-app-design-system";

type Props = {
  iconName?: IOIcons;
  iconColor?: IOColors;
  iconSize?: IOIconSizeScale;
  alignedCentral?: boolean;
  testID?: string;
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
    <View style={[styles.row, centralAlignment]} testID={props.testID}>
      <View style={styles.icon}>
        <Icon name={iconName} size={iconSize} color={iconColor} />
      </View>
      <HSpacer size={16} />
      <View style={styles.shrink}>{props.children}</View>
    </View>
  );
};
