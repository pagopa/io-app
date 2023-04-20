import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { IOColors } from "../../../components/core/variables/IOColors";

const styles = StyleSheet.create({
  componentWrapper: {
    marginBottom: 24
  },
  lastItem: {
    marginBottom: 0
  },
  labelWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12
  },
  componentLabel: {
    fontSize: 10
  },
  componenentLabelLight: {
    color: IOColors.bluegrey
  },
  componenentLabelDark: {
    color: IOColors.greyLight
  }
});

type DSComponentViewerBoxProps = {
  name: string;
  colorMode?: "dark" | "light";
  last?: boolean;
  children: React.ReactNode;
};

export const DSComponentViewerBox = ({
  name,
  colorMode = "light",
  last = false,
  children
}: DSComponentViewerBoxProps) => (
  <View style={last ? styles.lastItem : styles.componentWrapper}>
    {children}
    <View style={styles.labelWrapper}>
      {name && (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.componentLabel,
            colorMode === "light"
              ? styles.componenentLabelLight
              : styles.componenentLabelDark
          ]}
        >
          {name}
        </Text>
      )}
    </View>
  </View>
);
