import { SafeAreaView } from "react-native-safe-area-context";
import { PinCreation } from "../../settings/security/shared/components/PinCreation";

/**
 * A screen that allows the user to set the unlock code.
 */
const OnboardingPinScreen = () => (
  <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
    <PinCreation isOnboarding />
  </SafeAreaView>
);

export default OnboardingPinScreen;
