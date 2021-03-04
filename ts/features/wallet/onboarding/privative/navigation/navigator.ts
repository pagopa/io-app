import { createStackNavigator } from "react-navigation";
import ActivateBpdOnNewPrivativeScreen from "../screens/ActivateBpdOnNewPrivativeScreen";
import AddPrivativeCardScreen from "../screens/add/AddPrivativeCardScreen";
import AddPrivativeCardNumberScreen from "../screens/AddPrivativeCardNumberScreen";
import ChoosePrivativeBrandScreen from "../screens/ChoosePrivativeBrandScreen";
import SearchPrivativeCardScreen from "../screens/search/SearchPrivativeCardScreen";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "./routes";

const PaymentMethodOnboardingPrivativeNavigator = createStackNavigator(
  {
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_BRAND]: {
      screen: ChoosePrivativeBrandScreen
    },
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.INSERT_CARD_NUMBER]: {
      screen: AddPrivativeCardNumberScreen
    },
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.SEARCH_AVAILABLE]: {
      screen: SearchPrivativeCardScreen
    },
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.ADD_PRIVATIVE]: {
      screen: AddPrivativeCardScreen
    },
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.ACTIVATE_BPD_NEW]: {
      screen: ActivateBpdOnNewPrivativeScreen
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

export default PaymentMethodOnboardingPrivativeNavigator;
