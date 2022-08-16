import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { IOColors } from "../../../components/core/variables/IOColors";

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
  image: {
    width: "100%",
    height: "100%"
  },
  iconItem: {
    overflow: "hidden",
    position: "relative",
    aspectRatio: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1
  },
  iconItemSmall: {
    padding: 12
  },
  iconLabel: {
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

type IconViewerBoxProps = {
  name: string;
  image: React.ReactNode;
  size?: "small" | "medium" | "large";
};

const sizeMap = {
  small: {
    wrapper: styles.iconWrapperSmall,
    label: styles.iconLabelSmall
  },
  medium: {
    wrapper: styles.iconWrapperMedium,
    label: styles.iconLabelMedium
  },
  large: {
    wrapper: styles.iconWrapperLarge,
    label: styles.iconLabelLarge
  }
};

export const IconViewerBox = ({
  name,
  image,
  size = "small"
}: IconViewerBoxProps) => (
  <View style={[styles.iconWrapper, sizeMap[size].wrapper]}>
    <View
      style={[styles.iconItem, size === "small" ? styles.iconItemSmall : {}]}
    >
      {image}
    </View>
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4
      }}
    >
      {name && (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.iconLabel, sizeMap[size].label]}
        >
          {name}
        </Text>
      )}
    </View>
  </View>
);
