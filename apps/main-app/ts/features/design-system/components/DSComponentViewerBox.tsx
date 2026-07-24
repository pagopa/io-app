import { IOColors, useIOTheme } from "@io-app/design-system";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

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
    color: IOColors["grey-100"]
  }
});

type DSComponentViewerBoxProps = {
  children: ReactNode;
  colorMode?: "dark" | "light";
  fullWidth?: boolean;
  name: string;
  reverse?: boolean;
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
            ellipsizeMode="tail"
            numberOfLines={1}
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
