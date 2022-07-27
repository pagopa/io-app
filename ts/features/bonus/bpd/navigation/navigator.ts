import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import BpdDetailsScreen from "../screens/details/BpdDetailsScreen";
import BpdTransactionsRouterScreen from "../screens/details/transaction/v2/BpdTransactionsRouterScreen";
import CtaLandingScreen from "../screens/onboarding/BpdCTAStartOnboardingScreen";
import BpdInformationScreen from "../screens/onboarding/BpdInformationScreen";
import DeclarationScreen from "../screens/onboarding/declaration/DeclarationScreen";
import EnrollPaymentMethodsScreen from "../screens/onboarding/EnrollPaymentMethodsScreen";
import ErrorPaymentMethodsScreen from "../screens/onboarding/ErrorPaymentMethodsScreen";
import LoadActivateBpdScreen from "../screens/onboarding/LoadActivateBpdScreen";
import LoadBpdActivationStatus from "../screens/onboarding/LoadBpdActivationStatus";
import NoPaymentMethodsAvailableScreen from "../screens/onboarding/NoPaymentMethodsAvailableScreen";
import OptInPaymentMethodsCashbackUpdateScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsCashbackUpdateScreen";
import OptInPaymentMethodsChoiceScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsChoiceScreen";
import OptInPaymentMethodsThankYouDeleteMethodsScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsThankYouDeleteMethodsScreen";
import OptInPaymentMethodsThankYouKeepMethodsScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsThankYouKeepMethodsScreen";
import BPD_ROUTES from "./routes";

export const BpdOnboardingNavigator = createCompatNavigatorFactory(
  createStackNavigator
)(
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
    [BPD_ROUTES.ONBOARDING.ERROR_PAYMENT_METHODS]: {
      screen: ErrorPaymentMethodsScreen
    },
    [BPD_ROUTES.CTA_START_BPD]: {
      screen: CtaLandingScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gestureEnabled: false
    }
  }
);

export const BpdDetailsNavigator = createCompatNavigatorFactory(
  createStackNavigator
)(
  {
    [BPD_ROUTES.DETAILS]: {
      screen: BpdDetailsScreen
    },
    [BPD_ROUTES.TRANSACTIONS]: {
      screen: BpdTransactionsRouterScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gestureEnabled: false
    }
  }
);

export const OptInPaymentMethodNavigator = createCompatNavigatorFactory(
  createStackNavigator
)(
  {
    [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE]: {
      screen: OptInPaymentMethodsCashbackUpdateScreen
    },
    [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CHOICE]: {
      screen: OptInPaymentMethodsChoiceScreen
    },
    [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.THANK_YOU_DELETE_METHOD]: {
      screen: OptInPaymentMethodsThankYouDeleteMethodsScreen
    },
    [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.THANK_YOU_KEEP_METHOD]: {
      screen: OptInPaymentMethodsThankYouKeepMethodsScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gestureEnabled: false
    }
  }
);
