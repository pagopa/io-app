import {
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIOSelector } from "../../store/hooks";
import { debugDataSelector } from "../../store/reducers/debug";
import { DebugPrettyPrint } from "./DebugPrettyPrint";

type DebugDataOverlayProps = {
  onDismissed?: () => void;
};

export const DebugDataOverlay = ({ onDismissed }: DebugDataOverlayProps) => {
  const debugData = useIOSelector(debugDataSelector);
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={onDismissed} accessibilityRole="none">
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}
      >
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
    </SafeAreaView>
  );
};

const overlayColor = "#000000B0";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingTop: 60
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: overlayColor
  },
  scroll: {
    flexGrow: 0
  },
  scrollContainer: {
    paddingHorizontal: 16
  }
});
