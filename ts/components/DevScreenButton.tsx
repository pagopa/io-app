import { IOColors, IOVisualCostants } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DevScreenButtonProps = Readonly<{
  onPress: () => void;
}>;

const styles = StyleSheet.create({
  devButton: {
    position: "absolute",
    right: IOVisualCostants.appMarginDefault,
    zIndex: 1000,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderColor: IOColors["grey-450"]
  }
});

export const DevScreenButton = ({ onPress }: DevScreenButtonProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.devButton, { top: insets.top + 56 }]}
    >
      <Text style={{ color: IOColors["grey-700"] }}>Dev</Text>
    </Pressable>
  );
};
