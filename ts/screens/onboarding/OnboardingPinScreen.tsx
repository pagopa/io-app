import { SafeAreaView } from "react-native-safe-area-context";
import { IOStyles } from "@pagopa/io-app-design-system";
import { PinCreation } from "../../features/settings/security/shared/components/PinCreation";

/**
 * A screen that allows the user to set the unlock code.
 */
const OnboardingPinScreen = () => (
  <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
    <PinCreation isOnboarding />
  </SafeAreaView>
);

export default OnboardingPinScreen;
