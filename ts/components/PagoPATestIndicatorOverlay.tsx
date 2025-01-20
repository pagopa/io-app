import { SafeAreaView, StyleSheet } from "react-native";
import PagoPATestIndicator from "./PagoPATestIndicator";

const styles = StyleSheet.create({
  indicatorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000
  }
});

const PagoPATestIndicatorOverlay = () => (
  <SafeAreaView style={styles.indicatorContainer} pointerEvents="box-none">
    <PagoPATestIndicator />
  </SafeAreaView>
);

export default PagoPATestIndicatorOverlay;
