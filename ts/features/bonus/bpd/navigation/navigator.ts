import { createStackNavigator } from "react-navigation";
import { BpdInformationScreen } from "../screens/onboarding/BpdInformationScreen";
import { EligibilityKoUnderageScreen } from "../screens/onboarding/EligibilityKOUnderageScreen";
import { EnrollPaymentMethodsScreen } from "../screens/onboarding/EnrollPaymentMethodsScreen";
import { LoadActivateBpdScreen } from "../screens/onboarding/LoadActivateBpdScreen";
import { LoadBpdActivationStatus } from "../screens/onboarding/LoadBpdActivationStatus";
import { LoadEligibilityScreen } from "../screens/onboarding/LoadEligibilityScreen";
import { NoPaymentMethodsAvailableScreen } from "../screens/onboarding/NoPaymentMethodsAvailableScreen";
import { NotResidentInItalyKoScreen } from "../screens/onboarding/NotResidentInItalyKOScreen";
import { ResidenceDeclarationScreen } from "../screens/onboarding/ResidenceDeclarationScreen";

const BpdNavigator = createStackNavigator(
  {
    [BPD_ROUTES.ONBOARDING.LOAD_ACTIVATION_STATUS]: {
      screen: LoadBpdActivationStatus
    },
    [BPD_ROUTES.ONBOARDING.INFORMATION_TOS]: {
      screen: BpdInformationScreen
    },
    [BPD_ROUTES.ONBOARDING.ELIGIBILITY_LOAD]: {
      screen: LoadEligibilityScreen
    },
    [BPD_ROUTES.ONBOARDING.ELIGIBILITY_KO_UNDERAGE]: {
      screen: EligibilityKoUnderageScreen
    },
    [BPD_ROUTES.ONBOARDING.RESIDENCE_DECLARATION]: {
      screen: ResidenceDeclarationScreen
    },
    [BPD_ROUTES.ONBOARDING.RESIDENCE_KO_NOT_ITALIAN]: {
      screen: NotResidentInItalyKoScreen
    },
    [BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD]: {
      screen: LoadActivateBpdScreen
    },
    [BPD_ROUTES.ONBOARDING.ENROLL_PAYMENT_METHOD]: {
      screen: EnrollPaymentMethodsScreen
    },
    [BPD_ROUTES.ONBOARDING.ENROLL_PAYMENT_METHOD]: {
      screen: NoPaymentMethodsAvailableScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default BpdNavigator;
