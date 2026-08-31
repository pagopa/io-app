import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PagoPATestIndicator from "./PagoPATestIndicator";

const styles = StyleSheet.create({
  indicatorContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000
  }
});

const PagoPATestIndicatorOverlay = () => (
  <SafeAreaView pointerEvents="box-none" style={styles.indicatorContainer}>
    <PagoPATestIndicator />
  </SafeAreaView>
);

export default PagoPATestIndicatorOverlay;
