import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";

const styles = StyleSheet.create({
  componentWrapperFullWidth: {
    flexGrow: 1
  },
  labelWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  labelBottom: {
    marginTop: 12
  },
  labelTop: {
    marginBottom: 12
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
  reverse?: boolean;
  children: React.ReactNode;
};

export const DSComponentViewerBox = ({
  name,
  colorMode = "light",
  fullWidth = false,
  reverse = false,
  children
}: DSComponentViewerBoxProps) => {
  const theme = useIOTheme();

  return (
    <View
      style={[
        fullWidth && styles.componentWrapperFullWidth,
        reverse && { flexDirection: "column-reverse" }
      ]}
    >
      {reverse ? (
        <View style={{ flexDirection: "column" }}>{children}</View>
      ) : (
        children
      )}
      {name && (
        <View
          style={[
            styles.labelWrapper,
            reverse ? styles.labelTop : styles.labelBottom
          ]}
        >
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
        </View>
      )}
    </View>
  );
};
