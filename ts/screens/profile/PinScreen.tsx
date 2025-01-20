import { SafeAreaView } from "react-native-safe-area-context";
import { IOStyles } from "@pagopa/io-app-design-system";
import { PinCreation } from "../../components/screens/PinCreation/PinCreation";

/**
 * A screen that allows the user to change the unlock code.
 */
const PinScreen = () => (
  <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
    <PinCreation />
  </SafeAreaView>
);

export default PinScreen;
