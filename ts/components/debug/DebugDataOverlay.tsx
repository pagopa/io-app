import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useIOSelector } from "../../store/hooks";
import { debugDataSelector } from "../../store/reducers/debug";
import { DebugPrettyPrint } from "./DebugPrettyPrint";

type DebugDataOverlayProps = {
  onDismissed?: () => void;
};

export const DebugDataOverlay = ({ onDismissed }: DebugDataOverlayProps) => {
  const debugData = useIOSelector(debugDataSelector);

  return (
    <Pressable
      style={styles.container}
      accessibilityRole="none"
      onPress={onDismissed}
      pointerEvents="box-none"
    >
      <ScrollView>
        {Object.entries(debugData).map(([key, value]) => (
          <DebugPrettyPrint
            key={`debug_data_${key}`}
            title={key}
            data={value}
            expandable={true}
            isExpanded={false}
          />
        ))}
      </ScrollView>
    </Pressable>
  );
};

const backgroundColor = "#000000B0";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor,
    padding: 16,
    paddingTop: 110,
    zIndex: 999
  }
});
