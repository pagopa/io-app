import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { IOColors } from "../../../components/core/variables/IOColors";

export const iconItemGutter = 8;

const styles = StyleSheet.create({
  iconWrapper: {
    width: "25%",
    justifyContent: "flex-start",
    marginBottom: 16,
    paddingHorizontal: iconItemGutter / 2
  },
  iconWrapperSmall: {
    width: `${100 / 6}%`
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
    fontSize: 9,
    color: IOColors.bluegrey
  }
});

type IconViewerBoxProps = {
  name: string;
  image: React.ReactNode;
  size?: "small" | "medium";
};

export const IconViewerBox = ({
  name,
  image,
  size = "small"
}: IconViewerBoxProps) => (
  <View
    style={[
      styles.iconWrapper,
      size === "small" ? styles.iconWrapperSmall : {}
    ]}
  >
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
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.iconLabel}>
          {name}
        </Text>
      )}
    </View>
  </View>
);
