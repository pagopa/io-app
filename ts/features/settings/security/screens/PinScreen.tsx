import { SafeAreaView } from "react-native-safe-area-context";
import { PinCreation } from "../shared/components/PinCreation";

/**
 * A screen that allows the user to change the unlock code.
 */
const PinScreen = () => (
  <SafeAreaView testID="pinScreenTestID" edges={["bottom"]} style={{ flex: 1 }}>
    <PinCreation />
  </SafeAreaView>
);

export default PinScreen;
