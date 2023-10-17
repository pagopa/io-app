import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";

const styles = StyleSheet.create({
  componentWrapper: {
    marginBottom: 24
  },
  componentWrapperFullWidth: {
    flexGrow: 1
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
  componenentLabelDark: {
    color: IOColors.greyLight
  }
});

type DSComponentViewerBoxProps = {
  name: string;
  colorMode?: "dark" | "light";
  fullWidth?: boolean;
  last?: boolean;
  children: React.ReactNode;
};

export const DSComponentViewerBox = ({
  name,
  colorMode = "light",
  last = false,
  fullWidth = false,
  children
}: DSComponentViewerBoxProps) => {
  const theme = useIOTheme();

  return (
    <View
      style={[
        last ? styles.lastItem : styles.componentWrapper,
        fullWidth && styles.componentWrapperFullWidth
      ]}
    >
      {children}
      <View style={styles.labelWrapper}>
        {name && (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.componentLabel,
              colorMode === "light"
                ? { color: IOColors[theme["textBody-tertiary"]] }
                : styles.componenentLabelDark
            ]}
          >
            {name}
          </Text>
        )}
      </View>
    </View>
  );
};
