import { createStackNavigator } from "react-navigation-stack";
import { bpdTransactionsPaging } from "../../../../config";
import BpdDetailsScreen from "../screens/details/BpdDetailsScreen";
import BpdTransactionsScreen from "../screens/details/transaction/BpdTransactionsScreen";
import BpdTransactionsRouterScreen from "../screens/details/transaction/v2/BpdTransactionsRouterScreen";
import MainIbanScreen from "../screens/iban/MainIbanScreen";
import CtaLandingScreen from "../screens/onboarding/BpdCTAStartOnboardingScreen";
import BpdInformationScreen from "../screens/onboarding/BpdInformationScreen";
import DeclarationScreen from "../screens/onboarding/declaration/DeclarationScreen";
import EnrollPaymentMethodsScreen from "../screens/onboarding/EnrollPaymentMethodsScreen";
import ErrorPaymentMethodsScreen from "../screens/onboarding/ErrorPaymentMethodsScreen";
import LoadActivateBpdScreen from "../screens/onboarding/LoadActivateBpdScreen";
import LoadBpdActivationStatus from "../screens/onboarding/LoadBpdActivationStatus";
import NoPaymentMethodsAvailableScreen from "../screens/onboarding/NoPaymentMethodsAvailableScreen";
import OptInPaymentMethodsCashbackUpdateScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsCashbackUpdateScreen";
import OptInPaymentMethodsThankYouDeleteMethodsScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsThankYouDeleteMethodsScreen";
import BPD_ROUTES from "./routes";
import OptInPaymentMethodsThankYouKeepMethodsScreen from "../screens/optInPaymentMethods/OptInPaymentMethodsThankYouKeepMethodsScreen";

export const BpdOnboardingNavigator = createStackNavigator(
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
      gesturesEnabled: false
    }
  }
);

export const BpdDetailsNavigator = createStackNavigator(
  {
    [BPD_ROUTES.DETAILS]: {
      screen: BpdDetailsScreen
    },
    [BPD_ROUTES.TRANSACTIONS]: {
      screen: bpdTransactionsPaging
        ? BpdTransactionsRouterScreen
        : BpdTransactionsScreen
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

export const BpdIBANNavigator = createStackNavigator(
  {
    [BPD_ROUTES.IBAN]: {
      screen: MainIbanScreen
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

export const OptInPaymentMethodNavigator = createStackNavigator(
  {
    [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE]: {
      screen: OptInPaymentMethodsCashbackUpdateScreen
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
      gesturesEnabled: false
    }
  }
);
