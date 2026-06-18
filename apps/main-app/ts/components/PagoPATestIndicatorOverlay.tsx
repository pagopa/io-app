import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
