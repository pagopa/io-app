import { createStackNavigator } from "react-navigation-stack";
import AddPrivativeCardNumberScreen from "../screens/AddPrivativeCardNumberScreen";
import ChoosePrivativeIssuerScreen from "../screens/choosePrivativeIssuer/ChoosePrivativeIssuerScreen";
import PrivativeIssuerKoDisabled from "../screens/choosePrivativeIssuer/ko/PrivativeIssuerKoDisabled";
import PrivativeIssuerKoUnavailable from "../screens/choosePrivativeIssuer/ko/PrivativeIssuerKoUnavailable";
import SearchPrivativeCardScreen from "../screens/search/SearchPrivativeCardScreen";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "./routes";

const PaymentMethodOnboardingPrivativeNavigator = createStackNavigator(
  {
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_ISSUER]: {
      screen: ChoosePrivativeIssuerScreen
    },
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.INSERT_CARD_NUMBER]: {
      screen: AddPrivativeCardNumberScreen
    },
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.DISABLED_ISSUER]: {
      screen: PrivativeIssuerKoDisabled
    },
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.UNAVAILABLE_ISSUER]: {
      screen: PrivativeIssuerKoUnavailable
    },
    [WALLET_ONBOARDING_PRIVATIVE_ROUTES.SEARCH_AVAILABLE]: {
      screen: SearchPrivativeCardScreen
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
