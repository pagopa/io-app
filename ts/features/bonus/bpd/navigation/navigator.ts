import { createStackNavigator } from "react-navigation";
import MainIbanScreen from "../screens/iban/MainIbanScreen";
import BpdInformationScreen from "../screens/onboarding/BpdInformationScreen";
import DeclarationScreen from "../screens/onboarding/declaration/DeclarationScreen";
import EnrollPaymentMethodsScreen from "../screens/onboarding/EnrollPaymentMethodsScreen";
import LoadActivateBpdScreen from "../screens/onboarding/LoadActivateBpdScreen";
import LoadBpdActivationStatus from "../screens/onboarding/LoadBpdActivationStatus";
import NoPaymentMethodsAvailableScreen from "../screens/onboarding/NoPaymentMethodsAvailableScreen";
import TMPBpdScreen from "../screens/test/TMPBpdScreen";
import BPD_ROUTES from "./routes";

const BpdNavigator = createStackNavigator(
  {
    [BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS]: {
      screen: LoadBpdActivationStatus
    },
    [BPD_ROUTES.ONBOARDING.INFORMATION_TOS]: {
      screen: BpdInformationScreen
    },
    [BPD_ROUTES.ONBOARDING.DECLARATION]: {
      screen: DeclarationScreen
    },
    [BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD]: {
      screen: LoadActivateBpdScreen
    },
    [BPD_ROUTES.ONBOARDING.ENROLL_PAYMENT_METHODS]: {
      screen: EnrollPaymentMethodsScreen
    },
    [BPD_ROUTES.ONBOARDING.NO_PAYMENT_METHODS]: {
      screen: NoPaymentMethodsAvailableScreen
    },
    [BPD_ROUTES.IBAN]: {
      screen: MainIbanScreen
    },
    // TODO: remove after the introduction of the bpd detail screen
    [BPD_ROUTES.TEST]: {
      screen: TMPBpdScreen
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
