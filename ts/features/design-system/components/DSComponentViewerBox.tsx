import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { IOColors } from "../../../components/core/variables/IOColors";

const styles = StyleSheet.create({
  componentWrapper: {
    marginBottom: 24
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
  children: React.ReactNode;
};

export const DSComponentViewerBox = ({
  name,
  colorMode = "light",
  children
}: DSComponentViewerBoxProps) => (
  <View style={styles.componentWrapper}>
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
