import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  IOColors,
  hexToRgba
} from "../../../components/core/variables/IOColors";

export const iconItemGutter = 8;

const styles = StyleSheet.create({
  iconWrapper: {
    justifyContent: "flex-start",
    marginBottom: 16,
    paddingHorizontal: iconItemGutter / 2
  },
  iconWrapperSmall: {
    width: `${100 / 6}%`
  },
  iconWrapperMedium: {
    width: "20%"
  },
  iconWrapperLarge: {
    width: "25%"
  },
  iconWrapperAuto: {
    width: "auto"
  },
  nameWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4
  },
  iconItem: {
    overflow: "hidden",
    position: "relative",
    aspectRatio: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: hexToRgba(IOColors.black, 0.1),
    borderWidth: 1
  },
  iconItemLarger: {
    padding: 12
  },
  iconLabel: {
    fontSize: 10,
    color: IOColors.bluegrey
  },
  iconLabelSmall: {
    fontSize: 9
  },
  iconLabelMedium: {
    fontSize: 10
  },
  iconLabelLarge: {
    fontSize: 11
  }
});

type DSIconViewerBoxProps = {
  name: string;
  image: React.ReactNode;
  size?: "small" | "medium" | "large" | undefined;
};

const sizeMap = {
  small: {
    wrapper: styles.iconWrapperSmall,
    item: styles.iconItemLarger,
    label: styles.iconLabelSmall
  },
  medium: {
    wrapper: styles.iconWrapperMedium,
    item: null,
    label: styles.iconLabelMedium
  },
  large: {
    wrapper: styles.iconWrapperLarge,
    item: styles.iconItemLarger,
    label: styles.iconLabelLarge
  }
};

export const DSIconViewerBox = ({
  name,
  image,
  size
}: DSIconViewerBoxProps) => (
  <View
    style={[
      styles.iconWrapper,
      size ? sizeMap[size].wrapper : styles.iconWrapperAuto
    ]}
  >
    <View style={[styles.iconItem, size ? sizeMap[size].item : {}]}>
      {image}
    </View>
    <View style={styles.nameWrapper}>
      {name && (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.iconLabel, size ? sizeMap[size].label : {}]}
        >
          {name}
        </Text>
      )}
    </View>
  </View>
);
